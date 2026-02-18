"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TransactionForm from "./TransactionForm";
import { Transaction } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import { Check, ArrowRight, Wallet, TrendingUp, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialWizardProps {
    transactions: Transaction[];
}

const steps = [
    { id: "income", label: "Income", icon: <TrendingUp className="w-5 h-5" />, color: "bg-emerald-500" },
    { id: "expense", label: "Expenses", icon: <Wallet className="w-5 h-5" />, color: "bg-rose-500" },
    { id: "finish", label: "Finish", icon: <Check className="w-5 h-5" />, color: "bg-indigo-500" }
];

export default function FinancialWizard({ transactions }: FinancialWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState<"income" | "expense">("income");
    const [recentExpenses, setRecentExpenses] = useState<Transaction[]>([]);

    const handleIncomeAdded = (transaction: Transaction) => {
        setStep("expense");
    };

    const handleExpenseAdded = (transaction: Transaction) => {
        setRecentExpenses(prev => [transaction, ...prev]);
    };

    const handleFinish = () => {
        router.push("/dashboard");
    };

    const currentStepIndex = step === "income" ? 0 : 1;

    return (
        <div className="space-y-8 max-w-2xl mx-auto py-4">
            {/* Step Indicators */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted/30 -translate-y-1/2 -z-0" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 transition-all duration-500 -translate-y-1/2 -z-0"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                <div className="flex justify-between items-center relative z-10 px-2">
                    {steps.map((s, i) => {
                        const isActive = (step === s.id) || (step === "expense" && s.id === "income");
                        const isCurrent = step === s.id;

                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isCurrent ? 1.2 : 1,
                                        backgroundColor: isActive ? "var(--primary)" : "var(--muted)",
                                    }}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl transition-colors duration-300",
                                        isActive ? "bg-indigo-500" : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isActive && i < currentStepIndex ? <Check className="w-5 h-5" /> : s.icon}
                                </motion.div>
                                <span className={cn(
                                    "text-xs font-black uppercase tracking-widest",
                                    isActive ? "text-indigo-500" : "text-muted-foreground"
                                )}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Steps Content */}
            <div className="relative min-h-[500px]">
                <AnimatePresence mode="wait">
                    {step === "income" && (
                        <motion.div
                            key="income"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <TransactionForm
                                title="Set your Monthly Income"
                                forcedType="income"
                                hideTypeSelector
                                onAdd={handleIncomeAdded}
                            />
                            <div className="mt-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Start by recording your primary monthly earnings
                            </div>
                        </motion.div>
                    )}

                    {step === "expense" && (
                        <motion.div
                            key="expense"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    onClick={() => setStep("income")}
                                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground mr-auto"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-xs font-bold text-muted-foreground">STEP 2 OF 3</span>
                            </div>

                            <TransactionForm
                                title="Add typical Monthly Expenses"
                                forcedType="expense"
                                hideTypeSelector
                                onAdd={handleExpenseAdded}
                            />

                            {/* List of recently added expenses */}
                            <AnimatePresence>
                                {recentExpenses.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="glass p-5 rounded-2xl border border-white/5 space-y-3"
                                    >
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Session Ledger</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {recentExpenses.map((t, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                                                >
                                                    <div>
                                                        <div className="text-sm font-bold text-foreground">{t.description}</div>
                                                        <div className="text-[10px] text-muted-foreground">{t.category}</div>
                                                    </div>
                                                    <div className="text-sm font-black text-rose-500">-₹{t.amount.toLocaleString()}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.button
                                onClick={handleFinish}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-black rounded-2xl shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all"
                            >
                                <span>Go to Intelligence Dashboard</span>
                                <ArrowRight className="w-6 h-6" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
