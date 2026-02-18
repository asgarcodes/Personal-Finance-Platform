"use client";

import { useState, useEffect } from "react";
import { Budget, Transaction } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, AlertCircle, Info, PieChart, Wallet, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const DEFAULT_BUDGETS: Budget[] = [
    { category: "Food", limit: 15000, spent: 0, period: "monthly" },
    { category: "Transport", limit: 8000, spent: 0, period: "monthly" },
    { category: "Shopping", limit: 10000, spent: 0, period: "monthly" },
    { category: "Entertainment", limit: 5000, spent: 0, period: "monthly" },
];

interface BudgetPlannerProps {
    transactions?: Transaction[];
}

export default function BudgetPlanner({ transactions = [] }: BudgetPlannerProps) {
    const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: "", limit: "" });

    useEffect(() => {
        if (transactions.length === 0) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthExpenses = transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === "expense" && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        setBudgets(prevBudgets => prevBudgets.map(budget => {
            const spent = currentMonthExpenses
                .filter(t => t.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0);

            return { ...budget, spent };
        }));
    }, [transactions]);

    const addBudget = () => {
        if (newBudget.category && newBudget.limit) {
            const now = new Date();
            const currentMonthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return t.type === "expense" &&
                    tDate.getMonth() === now.getMonth() &&
                    tDate.getFullYear() === now.getFullYear();
            });

            const spent = currentMonthTransactions
                .filter(t => t.category.toLowerCase() === newBudget.category.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0);

            setBudgets([
                ...budgets,
                {
                    category: newBudget.category,
                    limit: parseFloat(newBudget.limit),
                    spent: spent,
                    period: "monthly",
                },
            ]);
            setNewBudget({ category: "", limit: "" });
            setShowAddForm(false);
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return "bg-rose-500";
        if (percentage >= 90) return "bg-orange-500";
        if (percentage >= 70) return "bg-amber-500";
        return "bg-emerald-500";
    };

    return (
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <PieChart className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">Budget Intelligence</h2>
                        <p className="text-xs text-muted-foreground">Monthly expense limits</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                        showAddForm ? "bg-muted text-foreground" : "bg-primary text-white"
                    )}
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAddForm ? "Cancel" : "Add Target"}
                </motion.button>
            </div>

            {/* Add Budget Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 bg-muted/40 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                                <input
                                    type="text"
                                    value={newBudget.category}
                                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                    placeholder="e.g., Grocery"
                                    className="w-full px-4 py-3 bg-background border border-border focus:border-primary/50 rounded-xl transition-all outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Limit (₹)</label>
                                <input
                                    type="number"
                                    value={newBudget.limit}
                                    onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                                    placeholder="5000"
                                    className="w-full px-4 py-3 bg-background border border-border focus:border-primary/50 rounded-xl transition-all outline-none text-sm"
                                />
                            </div>
                            <button
                                onClick={addBudget}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition-all"
                            >
                                Track Category
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Budget List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgets.map((budget, index) => {
                    const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                    const remaining = budget.limit - budget.spent;
                    const isOver = remaining < 0;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-5 rounded-2xl border border-white/5 bg-muted/20 hover:bg-muted/30 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-foreground">{budget.category}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", getProgressColor(percentage))} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {budget.period} Target
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-foreground">
                                        ₹{budget.spent.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        of ₹{budget.limit.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Progress
                                    value={percentage}
                                    className="h-2 bg-muted/50"
                                    indicatorClassName={getProgressColor(percentage)}
                                />
                                <div className="flex justify-between items-center">
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                        isOver ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                                    )}>
                                        {isOver
                                            ? `Over by ₹${Math.abs(remaining).toLocaleString()}`
                                            : `₹${remaining.toLocaleString()} Available`
                                        }
                                    </span>
                                    <span className="text-[10px] font-black text-muted-foreground">
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {budgets.length === 0 && (
                <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-white/5">
                    <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Start by defining your first spending target.</p>
                </div>
            )}

            <div className="mt-8 flex items-center gap-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">
                <Info className="w-4 h-4" />
                Live calculation based on current month transaction activity
            </div>
        </div>
    );
}
