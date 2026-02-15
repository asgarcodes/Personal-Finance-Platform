"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TransactionForm from "./TransactionForm";
import { Transaction } from "@/lib/types";

interface FinancialWizardProps {
    transactions: Transaction[];
}

export default function FinancialWizard({ transactions }: FinancialWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState<"income" | "expense">("income");
    const [recentExpenses, setRecentExpenses] = useState<Transaction[]>([]);

    const handleIncomeAdded = (transaction: Transaction) => {
        // Income is saved to Firestore by TransactionForm
        // Just move to next step
        setStep("expense");
    };

    const handleExpenseAdded = (transaction: Transaction) => {
        // Expense is saved to Firestore by TransactionForm
        // Add to local list to show user what they've added
        setRecentExpenses(prev => [...prev, transaction]);
    };

    const handleFinish = () => {
        // Navigate to dashboard
        router.push("/dashboard");
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-4 mb-6">
                <div className={`flex items-center ${step === "income" ? "text-indigo-600 font-bold" : "text-gray-400"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 border-2 ${step === "income" ? "border-indigo-600 bg-indigo-50" : "border-gray-300"}`}>1</div>
                    Income
                </div>
                <div className={`h-1 w-12 ${step === "expense" ? "bg-indigo-600" : "bg-gray-200"}`} />
                <div className={`flex items-center ${step === "expense" ? "text-indigo-600 font-bold" : "text-gray-400"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 border-2 ${step === "expense" ? "border-indigo-600 bg-indigo-50" : "border-gray-300"}`}>2</div>
                    Expenses
                </div>
                <div className="h-1 w-12 bg-gray-200" />
                <div className="flex items-center text-gray-400">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 border-2 border-gray-300">✓</div>
                    Finish
                </div>
            </div>

            {/* Steps Content */}
            {step === "income" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <TransactionForm
                        title="Step 1: Add Income"
                        forcedType="income"
                        hideTypeSelector
                        onAdd={handleIncomeAdded}
                    />
                </div>
            )}

            {step === "expense" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                    <TransactionForm
                        title="Step 2: Add Expenses"
                        forcedType="expense"
                        hideTypeSelector
                        onAdd={handleExpenseAdded}
                    />

                    {/* List of recently added expenses in this session */}
                    {recentExpenses.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Expenses Added in this Session:</h4>
                            <ul className="space-y-1 max-h-32 overflow-y-auto">
                                {recentExpenses.map((t, idx) => (
                                    <li key={idx} className="text-sm flex justify-between text-gray-700 dark:text-gray-400">
                                        <span>{t.description}</span>
                                        <span className="font-medium text-red-500">-₹{t.amount}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handleFinish}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <span>Finish & Go to Dashboard</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            All transactions are saved automatically.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
