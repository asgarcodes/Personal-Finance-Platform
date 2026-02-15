"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { autoCategorize } from "@/lib/categorizationEngine";
import { addTransaction } from "@/firebase/transactions";
import { toast } from "sonner";

interface TransactionFormProps {
    onAdd?: (transaction: Transaction) => void;
    forcedType?: Transaction["type"];
    title?: string;
    hideTypeSelector?: boolean;
}

// User ID for demo purposes - should match dashboard
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

    // Update form type if forcedType changes
    useEffect(() => {
        if (forcedType) {
            setFormData(prev => ({ ...prev, type: forcedType }));
        }
    }, [forcedType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const transaction: Transaction = {
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category || autoCategory || (formData.type === "income" ? "Salary" : "General"),
            description: formData.description,
            date: formData.date,
        };

        try {
            // Save to Firestore
            await addTransaction({
                userId: USER_ID,
                transaction: transaction
            });

            // Update local UI
            if (onAdd) {
                onAdd(transaction);
            }

            toast.success(`${transaction.type === 'income' ? 'Income' : 'Expense'} saved successfully!`);

            // Reset form
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
            toast.error("Failed to save transaction. Please try again.");
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white">{title || "Add Transaction"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type Selector (Conditional) */}
                {!hideTypeSelector && (
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "expense" })}
                                className={`flex-1 p-3 rounded-lg border font-medium transition-colors ${formData.type === "expense"
                                    ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400"
                                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    }`}
                            >
                                💸 Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "income" })}
                                className={`flex-1 p-3 rounded-lg border font-medium transition-colors ${formData.type === "income"
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400"
                                    : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    }`}
                            >
                                💰 Income
                            </button>
                        </div>
                    </div>
                )}

                {/* Amount */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Amount (₹)</label>
                    <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                        placeholder="Enter amount"
                        autoFocus={!!forcedType}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                        placeholder="e.g., Salary, Rent"
                    />
                    {autoCategory && autoCategory !== "Uncategorized" && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            💡 Suggested category: <strong className="text-gray-700 dark:text-gray-200">{autoCategory}</strong>
                        </div>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Category {autoCategory && "(or use suggested)"}</label>
                    <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                        placeholder={autoCategory || "Food, Transport, Shopping..."}
                    />
                </div>

                {/* Date */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full p-4 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-700 hover:from-indigo-600 hover:to-purple-800 text-white font-semibold shadow-md transform hover:scale-[1.02] transition-all duration-200 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Saving...' : (title ? title.replace("Step 1: ", "").replace("Step 2: ", "").replace("Add ", "Save ") : 'Add Transaction')}
                </button>
            </form>
        </div>
    );
}
