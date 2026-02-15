"use client";

import { useState, useEffect } from "react";
import { Budget, Transaction } from "@/lib/types";

// Default categories to get started
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

    // Calculate real spending based on transactions
    useEffect(() => {
        if (transactions.length === 0) return;

        // Current Month Filter
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthExpenses = transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === "expense" && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        // Update spent amounts for existing budgets
        setBudgets(prevBudgets => prevBudgets.map(budget => {
            // Case-insensitive match for robustness
            const spent = currentMonthExpenses
                .filter(t => t.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                ...budget,
                spent: spent
            };
        }));
    }, [transactions]);


    const addBudget = () => {
        if (newBudget.category && newBudget.limit) {
            // Immediately calculate spent for the new category too
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

    const getProgressColor = (spent: number, limit: number) => {
        const percentage = (spent / limit) * 100;
        if (percentage >= 100) return "bg-red-600";
        if (percentage >= 90) return "bg-red-500";
        if (percentage >= 70) return "bg-orange-500";
        return "bg-green-500";
    };

    const getProgressTextColor = (spent: number, limit: number) => {
        const percentage = (spent / limit) * 100;
        if (percentage >= 100) return "text-red-600";
        if (percentage >= 90) return "text-red-500";
        if (percentage >= 70) return "text-orange-500";
        return "text-green-500";
    };

    const getProgressPercentage = (spent: number, limit: number) => {
        return Math.min((spent / limit) * 100, 100);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Budget Planner</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors border border-transparent"
                >
                    {showAddForm ? "Cancel" : "+ Add Budget"}
                </button>
            </div>

            {/* Add Budget Form */}
            {showAddForm && (
                <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                            </label>
                            <input
                                type="text"
                                value={newBudget.category}
                                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                placeholder="e.g., Health"
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                Monthly Limit (₹)
                            </label>
                            <input
                                type="number"
                                value={newBudget.limit}
                                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                                placeholder="5000"
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            />
                        </div>
                        <button
                            onClick={addBudget}
                            className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            {/* Budget List */}
            <div className="space-y-4">
                {budgets.map((budget, index) => {
                    const percentage = getProgressPercentage(budget.spent, budget.limit);
                    const progressColorClass = getProgressColor(budget.spent, budget.limit);
                    const progressTextColorClass = getProgressTextColor(budget.spent, budget.limit);
                    const remaining = budget.limit - budget.spent;

                    return (
                        <div
                            key={index}
                            className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-700/30"
                        >
                            <div className="flex justify-between mb-2">
                                <div>
                                    <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                        {budget.category}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 uppercase tracking-wide">
                                        {budget.period}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-base font-semibold ${progressTextColorClass}`}>
                                        ₹{budget.spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                                    </div>
                                    <div className={`text-xs mt-0.5 ${remaining >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 font-bold"}`}>
                                        {remaining >= 0 ? `₹${remaining.toLocaleString()} left` : `₹${Math.abs(remaining).toLocaleString()} over budget`}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${progressColorClass}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 text-right">
                                {percentage.toFixed(0)}% used
                            </div>
                        </div>
                    );
                })}
            </div>

            {budgets.length === 0 && (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                    No budgets set. Click "Add Budget" to get started.
                </div>
            )}

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <span>ℹ️</span>
                Note: Budgets calculate expenses from the current month only.
            </div>
        </div>
    );
}
