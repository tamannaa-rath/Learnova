import { POST } from "@/app/api/register/route";
import { connectDb } from "@/lib/mongodb";
import { put, del } from "@vercel/blob";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => {
      return {
        status: init?.status || 200,
        json: async () => body,
        headers: new Map(),
      };
    }),
  },
}));

jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
  del: jest.fn(),
}));

jest.mock("@/lib/mongodb", () => ({
  connectDb: jest.fn(),
}));

describe("POST /api/register - Security & Validation Tests", () => {
  let mockFindOne;
  let mockInsertOne;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindOne = jest.fn();
    mockInsertOne = jest.fn();

    connectDb.mockResolvedValue({
      collection: jest.fn().mockReturnValue({
        findOne: mockFindOne,
        insertOne: mockInsertOne,
      }),
    });

    put.mockResolvedValue({ url: "https://example.com/blob.jpg" });
  });

  const createMockFile = (mimeType, size, magicBytes = []) => {
    const buffer = new Uint8Array(magicBytes.concat(new Array(Math.max(0, 12 - magicBytes.length)).fill(0))).buffer;
    const BaseClass = typeof File !== "undefined" ? File : class {};
    const mockFileObj = Object.create(BaseClass.prototype);
    Object.defineProperty(mockFileObj, "type", { value: mimeType, writable: true, enumerable: true, configurable: true });
    Object.defineProperty(mockFileObj, "size", { value: size, writable: true, enumerable: true, configurable: true });
    Object.defineProperty(mockFileObj, "arrayBuffer", { value: jest.fn().mockResolvedValue(buffer), writable: true, enumerable: true, configurable: true });
    Object.defineProperty(mockFileObj, "slice", {
      value: jest.fn().mockReturnValue({
        arrayBuffer: jest.fn().mockResolvedValue(buffer),
      }),
      writable: true,
      enumerable: true,
      configurable: true
    });
    return mockFileObj;
  };

  const mockFile = createMockFile("image/jpeg", 1024, [0xff, 0xd8, 0xff]);

  const createMockRequest = (data) => {
    return {
      formData: jest.fn().mockResolvedValue({
        get: (key) => data[key],
      }),
    };
  };

  test("accepts valid email and registers user successfully", async () => {
    mockFindOne.mockResolvedValue(null);
    mockInsertOne.mockResolvedValue({ insertedId: "mock-id" });

    const req = createMockRequest({
      name: "John Doe",
      rollNo: "123456",
      email: "user+tag@domain.co.uk",
      photo: mockFile,
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("user+tag@domain.co.uk");
    expect(mockInsertOne).toHaveBeenCalled();
  });

  test.each([
    ["invalid-email"],
    ["test@domain"],
    ["@domain.com"],
    ["user@domain."],
    ["user @domain.com"],
    ["user@ domain.com"],
  ])("rejects invalid email format '%s' with 400 Bad Request", async (invalidEmail) => {
    const req = createMockRequest({
      name: "John Doe",
      rollNo: "123456",
      email: invalidEmail,
      photo: mockFile,
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Invalid email address");
    expect(mockInsertOne).not.toHaveBeenCalled();
    expect(connectDb).not.toHaveBeenCalled(); // Validation must happen before DB connection or insertion
  });

  test("deletes uploaded blob if database insertion fails (rollback)", async () => {
    mockFindOne.mockResolvedValue(null);
    mockInsertOne.mockRejectedValue(new Error("Database write failed"));

    const req = createMockRequest({
      name: "John Doe",
      rollNo: "123456",
      email: "user@domain.com",
      photo: mockFile,
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Database write failed");
    expect(put).toHaveBeenCalled();
    expect(del).toHaveBeenCalledWith("https://example.com/blob.jpg");
  });
});
