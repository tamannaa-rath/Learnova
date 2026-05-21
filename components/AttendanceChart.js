"use client";
import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", attendance: 100 },
  { day: "Tue", attendance: 80 },
  { day: "Wed", attendance: 100 },
  { day: "Thu", attendance: 60 },
  { day: "Fri", attendance: 100 },
];

const monthlyData = [
  { month: "Jan", attendance: 85 },
  { month: "Feb", attendance: 78 },
  { month: "Mar", attendance: 92 },
  { month: "Apr", attendance: 88 },
  { month: "May", attendance: 76 },
];

const subjectData = [
  { subject: "Math", attendance: 90 },
  { subject: "Science", attendance: 75 },
  { subject: "English", attendance: 85 },
  { subject: "History", attendance: 60 },
  { subject: "PE", attendance: 95 },
];

const getColor = (value) => {
  if (value >= 75) return "#22c55e";
  if (value >= 60) return "#eab308";
  return "#ef4444";
};

export default function AttendanceChart() {
  const [activeTab, setActiveTab] = useState("weekly");

  const overallAttendance = 82;

  return (
    <div className="bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        📈 Attendance Analytics
      </h3>

      {/* Overall Badge */}
      <div className="flex items-center space-x-4 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg border-4"
          style={{ borderColor: getColor(overallAttendance) }}
        >
          {overallAttendance}%
        </div>
        <div>
          <p className="text-white font-medium">Overall Attendance</p>
          <p
            className="text-sm font-medium"
            style={{ color: getColor(overallAttendance) }}
          >
            {overallAttendance >= 75
              ? "✅ Good Standing"
              : overallAttendance >= 60
              ? "⚠️ At Risk"
              : "🔴 Critical"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {["weekly", "monthly", "subjects"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-white/60 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Weekly Chart */}
      {activeTab === "weekly" && (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e1e2e", border: "none", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.attendance)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Monthly Chart */}
      {activeTab === "monthly" && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e1e2e", border: "none", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Subject wise */}
      {activeTab === "subjects" && (
        <div className="space-y-3">
          {subjectData.map((item) => (
            <div key={item.subject} className="flex items-center space-x-3">
              <p className="text-white/80 text-sm w-16">{item.subject}</p>
              <div className="flex-1 bg-white/10 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${item.attendance}%`,
                    backgroundColor: getColor(item.attendance),
                  }}
                />
              </div>
              <p className="text-white text-sm w-10 text-right">
                {item.attendance}%
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex space-x-4 mt-4">
        <span className="flex items-center text-xs text-white/60">
          <span className="w-3 h-3 rounded-full bg-green-500 mr-1" /> Good (≥75%)
        </span>
        <span className="flex items-center text-xs text-white/60">
          <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1" /> At Risk (60-75%)
        </span>
        <span className="flex items-center text-xs text-white/60">
          <span className="w-3 h-3 rounded-full bg-red-500 mr-1" /> Critical (&lt;60%)
        </span>
      </div>
    </div>
  );
}