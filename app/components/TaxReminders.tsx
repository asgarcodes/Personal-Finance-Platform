"use client";

import { useState } from "react";
import { TaxReminder } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
    Calendar, Bell, CheckCircle2, AlertCircle,
    Clock, Tag, Trash2, Plus, Info,
    ArrowRight, Bookmark, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
];

export default function TaxReminders() {
    const [reminders, setReminders] = useState<TaxReminder[]>(DEFAULT_REMINDERS);

    const toggleStatus = (index: number) => {
        const updated = [...reminders];
        updated[index].status = updated[index].status === "pending" ? "completed" : "pending";
        setReminders(updated);
    };

    const getDaysUntil = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getPriorityStyles = (priority: TaxReminder["priority"]) => {
        switch (priority) {
            case 'high': return "text-rose-500 bg-rose-500/10 border-rose-500/20";
            case 'medium': return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            default: return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        }
    };

    const sortedReminders = [...reminders].sort((a, b) => {
        if (a.status === "completed" && b.status !== "completed") return 1;
        if (a.status !== "completed" && b.status === "completed") return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const pendingCount = reminders.filter(r => r.status === "pending").length;

    return (
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">Compliance Engine</h2>
                        <p className="text-xs text-muted-foreground">{pendingCount} critical deadlines approaching</p>
                    </div>
                </div>
            </div>

            {/* Visual Priority Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-1">High Urgency</div>
                    <div className="text-2xl font-black text-rose-500">
                        {reminders.filter(r => r.priority === 'high' && r.status === 'pending').length}
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Next 30 Days</div>
                    <div className="text-2xl font-black text-amber-500">
                        {reminders.filter(r => {
                            const d = getDaysUntil(r.dueDate);
                            return d >= 0 && d <= 30 && r.status === 'pending';
                        }).length}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                <AnimatePresence initial={false}>
                    {sortedReminders.map((reminder, idx) => {
                        const days = getDaysUntil(reminder.dueDate);
                        const isCompleted = reminder.status === 'completed';
                        const originalIdx = reminders.findIndex(r => r === reminder);

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: isCompleted ? 0.6 : 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={cn(
                                    "p-5 rounded-2xl border border-white/5 bg-muted/20 hover:bg-muted/30 transition-all group flex items-start gap-4",
                                    isCompleted && "grayscale contrast-75 bg-muted/10 border-transparent shadow-none"
                                )}
                            >
                                <button
                                    onClick={() => toggleStatus(originalIdx)}
                                    className={cn(
                                        "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                        isCompleted
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : "border-muted-foreground/30 hover:border-primary/50"
                                    )}
                                >
                                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                                </button>

                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={cn("font-black text-foreground transition-all", isCompleted && "line-through text-muted-foreground")}>
                                                {reminder.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground leading-snug">{reminder.description}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest leading-none mb-1">Due Date</div>
                                            <div className="text-xs font-black text-foreground">
                                                {new Date(reminder.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge className={cn("text-[8px] font-black uppercase tracking-widest border border-white/5", getPriorityStyles(reminder.priority))}>
                                            {reminder.priority}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/70">
                                            <Tag className="w-3 h-3" />
                                            {reminder.category}
                                        </div>
                                        {!isCompleted && (
                                            <div className={cn(
                                                "flex items-center gap-1 text-[8px] font-black uppercase tracking-widest",
                                                days < 0 ? "text-rose-500" : days <= 7 ? "text-amber-500" : "text-emerald-500"
                                            )}>
                                                <Clock className="w-3 h-3" />
                                                {days < 0 ? `${Math.abs(days)}d Overdue` : days === 0 ? "Today" : `${days}d Left`}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="mt-8 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-2 text-[10px] font-bold text-orange-500/70 uppercase tracking-widest">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5" />
                Deadlines calculated based on the IT Act, 1961 (India)
            </div>
        </div>
    );
}
