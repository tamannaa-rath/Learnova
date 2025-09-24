import { connectDb } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { userMessage, botMessage } = await req.json();

    const db = await connectDb();
    const collection = db.collection("conversations");

    const newConversation = {
      userMessage,
      botMessage,
      timestamp: new Date(),
    };

    await collection.insertOne(newConversation);

    return new Response(
      JSON.stringify({ success: true, data: newConversation }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Save Message Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
