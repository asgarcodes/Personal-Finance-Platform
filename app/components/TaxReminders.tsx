"use client";

import { useState } from "react";
import { TaxReminder } from "@/lib/types";

const DEFAULT_REMINDERS: TaxReminder[] = [
    {
        title: "File ITR for FY 2023-24",
        description: "Last date to file Income Tax Return without penalty",
        dueDate: "2024-07-31",
        category: "ITR",
        status: "pending",
        priority: "high",
    },
    {
        title: "Q4 Advance Tax Payment",
        description: "Pay 4th installment of advance tax (100% of total liability)",
        dueDate: "2024-03-15",
        category: "Advance Tax",
        status: "pending",
        priority: "high",
    },
    {
        title: "Form 16 Collection",
        description: "Collect Form 16 from employer for salary TDS details",
        dueDate: "2024-06-15",
        category: "TDS",
        status: "pending",
        priority: "medium",
    },
    {
        title: "Investment Proof Submission",
        description: "Submit 80C investment proofs to employer for TDS adjustment",
        dueDate: "2024-03-31",
        category: "Other",
        status: "pending",
        priority: "medium",
    },
];

export default function TaxReminders() {
    const [reminders, setReminders] = useState<TaxReminder[]>(DEFAULT_REMINDERS);
    const [showAddForm, setShowAddForm] = useState(false);

    const toggleStatus = (index: number) => {
        const updated = [...reminders];
        updated[index].status = updated[index].status === "pending" ? "completed" : "pending";
        setReminders(updated);
    };

    const removeReminder = (index: number) => {
        setReminders(reminders.filter((_, i) => i !== index));
    };

    const getDaysUntil = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getPriorityColor = (priority: TaxReminder["priority"]) => {
        const colors = {
            high: "#f44336",
            medium: "#FF9800",
            low: "#4CAF50",
        };
        return colors[priority];
    };

    const getCategoryIcon = (category: TaxReminder["category"]) => {
        const icons = {
            ITR: "📄",
            "Advance Tax": "💰",
            TDS: "📝",
            GST: "🏪",
            Other: "📌",
        };
        return icons[category] || "📌";
    };

    const sortedReminders = [...reminders].sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const pendingCount = reminders.filter(r => r.status === "pending").length;
    const completedCount = reminders.filter(r => r.status === "completed").length;

    return (
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h2 style={{ fontSize: "20px", color: "#333", marginBottom: "4px" }}>Tax Deadlines & Reminders</h2>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                        {pendingCount} pending • {completedCount} completed
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "#ffebee", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#c62828", marginBottom: "4px" }}>High Priority</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#c62828" }}>
                        {reminders.filter(r => r.priority === "high" && r.status === "pending").length}
                    </div>
                </div>
                <div style={{ background: "#fff3e0", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#e65100", marginBottom: "4px" }}>Upcoming</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#e65100" }}>
                        {reminders.filter(r => {
                            const days = getDaysUntil(r.dueDate);
                            return days >= 0 && days <= 30 && r.status === "pending";
                        }).length}
                    </div>
                </div>
                <div style={{ background: "#e8f5e9", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#2e7d32", marginBottom: "4px" }}>Completed</div>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#2e7d32" }}>
                        {completedCount}
                    </div>
                </div>
            </div>

            {/* Reminders List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sortedReminders.map((reminder, index) => {
                    const daysUntil = getDaysUntil(reminder.dueDate);
                    const isOverdue = daysUntil < 0;
                    const isUrgent = daysUntil >= 0 && daysUntil <= 7;

                    return (
                        <div
                            key={index}
                            style={{
                                padding: "16px",
                                border: `2px solid ${reminder.status === "completed" ? "#e0e0e0" : getPriorityColor(reminder.priority)}`,
                                borderRadius: "8px",
                                background: reminder.status === "completed" ? "#f5f5f5" : "white",
                                opacity: reminder.status === "completed" ? 0.7 : 1,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                <div style={{ flex: 1, display: "flex", gap: "12px", alignItems: "start" }}>
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={reminder.status === "completed"}
                                        onChange={() => toggleStatus(sortedReminders.findIndex(r => r === reminder))}
                                        style={{
                                            width: "20px",
                                            height: "20px",
                                            cursor: "pointer",
                                            marginTop: "2px",
                                        }}
                                    />

                                    {/* Icon */}
                                    <div style={{ fontSize: "24px" }}>{getCategoryIcon(reminder.category)}</div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#333",
                                            marginBottom: "4px",
                                            textDecoration: reminder.status === "completed" ? "line-through" : "none",
                                        }}>
                                            {reminder.title}
                                        </div>
                                        <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                                            {reminder.description}
                                        </div>
                                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                                            <div style={{
                                                fontSize: "12px",
                                                padding: "4px 8px",
                                                background: getPriorityColor(reminder.priority),
                                                color: "white",
                                                borderRadius: "4px",
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                            }}>
                                                {reminder.priority}
                                            </div>
                                            <div style={{
                                                fontSize: "12px",
                                                padding: "4px 8px",
                                                background: "#f5f5f5",
                                                color: "#666",
                                                borderRadius: "4px",
                                            }}>
                                                {reminder.category}
                                            </div>
                                            <div style={{
                                                fontSize: "12px",
                                                padding: "4px 8px",
                                                background: isOverdue ? "#ffebee" : isUrgent ? "#fff3e0" : "#e8f5e9",
                                                color: isOverdue ? "#c62828" : isUrgent ? "#e65100" : "#2e7d32",
                                                borderRadius: "4px",
                                                fontWeight: "600",
                                            }}>
                                                {isOverdue
                                                    ? `${Math.abs(daysUntil)} days overdue`
                                                    : daysUntil === 0
                                                        ? "Due today!"
                                                        : daysUntil === 1
                                                            ? "Due tomorrow"
                                                            : `${daysUntil} days left`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div style={{ textAlign: "right", marginLeft: "16px" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Due Date</div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                                        {new Date(reminder.dueDate).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {reminders.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    No reminders set. All clear! ✅
                </div>
            )}
        </div>
    );
}
