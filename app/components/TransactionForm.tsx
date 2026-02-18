"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { autoCategorize } from "@/lib/categorizationEngine";
import { addTransaction } from "@/firebase/transactions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Sparkles, Calendar, Tag, CreditCard, ChevronRight, Check } from "lucide-react";

interface TransactionFormProps {
    onAdd?: (transaction: Transaction) => void;
    forcedType?: Transaction["type"];
    title?: string;
    hideTypeSelector?: boolean;
}

const USER_ID = "demo-user";

export default function TransactionForm({ onAdd, forcedType, title, hideTypeSelector }: TransactionFormProps) {
    const [formData, setFormData] = useState({
        amount: "",
        type: forcedType || "expense",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoCategory, setAutoCategory] = useState("");

    useEffect(() => {
        if (forcedType) {
            setFormData(prev => ({ ...prev, type: forcedType }));
        }
    }, [forcedType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        setIsSubmitting(true);

        const transaction: Transaction = {
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category || autoCategory || (formData.type === "income" ? "Salary" : "General"),
            description: formData.description,
            date: formData.date,
        };

        try {
            const saveWithTimeout = Promise.race([
                addTransaction({
                    userId: USER_ID,
                    transaction: transaction
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Request timed out")), 10000)
                )
            ]);

            await saveWithTimeout;

            if (onAdd) onAdd(transaction);

            toast.success(`${transaction.type === 'income' ? 'Income' : 'Expense'} recorded!`);

            setFormData({
                amount: "",
                type: forcedType || "expense",
                category: "",
                description: "",
                date: new Date().toISOString().split("T")[0],
            });
            setAutoCategory("");
        } catch (error) {
            console.error("Failed to add transaction:", error);
            toast.error("Failed to save transaction.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDescriptionChange = (desc: string) => {
        setFormData({ ...formData, description: desc });
        if (desc.length > 2) {
            const suggested = autoCategorize(desc);
            setAutoCategory(suggested);
        } else {
            setAutoCategory("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                {formData.type === 'income' ? <Sparkles className="w-24 h-24" /> : <CreditCard className="w-24 h-24" />}
            </div>

            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-primary rounded-full" />
                {title || "Add Transaction"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Selector */}
                {!hideTypeSelector && (
                    <div className="flex p-1 bg-muted/50 rounded-xl gap-1">
                        {[
                            { id: "expense", label: "Expense", icon: "💸", color: "text-red-500" },
                            { id: "income", label: "Income", icon: "💰", color: "text-emerald-500" }
                        ].map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, type: type.id as any })}
                                className={cn(
                                    "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
                                    formData.type === type.id
                                        ? "bg-background shadow-sm text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <span className={cn("text-lg", formData.type === type.id ? "" : "grayscale")}>{type.icon}</span>
                                {type.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Amount Input Component */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Amount</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl font-black text-muted-foreground group-focus-within:text-primary transition-colors">₹</div>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="block w-full pl-12 pr-4 py-4 text-3xl font-black bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background rounded-2xl transition-all outline-none placeholder:text-muted-foreground/30"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Description & Auto-category */}
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">What was this for?</label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={formData.description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            className="w-full px-4 py-3 bg-muted/30 border border-white/5 focus:border-primary/50 focus:bg-background rounded-xl transition-all outline-none"
                            placeholder="e.g., Starbucks Coffee"
                        />
                        <AnimatePresence>
                            {autoCategory && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20"
                                >
                                    <Tag className="w-2 h-2" />
                                    {autoCategory}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-muted/30 border border-white/5 focus:border-primary/50 focus:bg-background rounded-xl transition-all outline-none text-sm"
                            placeholder={autoCategory || "Food..."}
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 bg-muted/30 border border-white/5 focus:border-primary/50 focus:bg-background rounded-xl transition-all outline-none text-sm appearance-none"
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "w-full py-4 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-2 mt-4 transition-all",
                        formData.type === 'income' ? "bg-emerald-600 shadow-emerald-600/20" : "bg-primary shadow-primary/20",
                        isSubmitting && "opacity-50 pointer-events-none"
                    )}
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {formData.type === 'income' ? "Claim Income" : "Record Expense"}
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
}
