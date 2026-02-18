"use client";

import { useState } from "react";
import { Loan } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
    Home, Car, GraduationCap, CreditCard, Landmark,
    Calculator, Plus, X, ArrowUpRight, Calendar,
    Clock, Percent, Info, TrendingDown, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const DEMO_LOANS: Loan[] = [
    {
        name: "Home Loan - HDFC",
        type: "home",
        principal: 2500000,
        remainingAmount: 1800000,
        interestRate: 8.5,
        emiAmount: 35000,
        startDate: "2022-01-01",
        endDate: "2042-01-01",
        nextEmiDate: "2024-03-01",
    },
    {
        name: "Car Loan - SBI",
        type: "car",
        principal: 600000,
        remainingAmount: 320000,
        interestRate: 9.2,
        emiAmount: 18500,
        startDate: "2023-06-01",
        endDate: "2028-06-01",
        nextEmiDate: "2024-03-01",
    },
];

export default function LoanManager() {
    const [loans, setLoans] = useState<Loan[]>(DEMO_LOANS);
    const [showCalculator, setShowCalculator] = useState(false);

    const [calcData, setCalcData] = useState({
        principal: "1000000",
        interestRate: "8.5",
        tenureMonths: "120",
    });

    const calculateEMI = () => {
        const P = parseFloat(calcData.principal);
        const R = parseFloat(calcData.interestRate) / 100 / 12;
        const N = parseFloat(calcData.tenureMonths);
        if (P > 0 && R > 0 && N > 0) {
            const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
            return Math.round(emi);
        }
        return 0;
    };

    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const totalMonthlyEMI = loans.reduce((sum, loan) => sum + loan.emiAmount, 0);

    const getLoanIcon = (type: Loan["type"]) => {
        switch (type) {
            case 'home': return <Home className="w-5 h-5 text-indigo-500" />;
            case 'car': return <Car className="w-5 h-5 text-blue-500" />;
            case 'education': return <GraduationCap className="w-5 h-5 text-emerald-500" />;
            case 'credit-card': return <CreditCard className="w-5 h-5 text-rose-500" />;
            default: return <Landmark className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">Debt Analysis</h2>
                        <p className="text-xs text-muted-foreground">Liabilities & EMI schedules</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCalculator(!showCalculator)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        showCalculator ? "bg-muted text-foreground" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    )}
                >
                    <Calculator className="w-4 h-4" />
                    {showCalculator ? "View Loans" : "EMI Calc"}
                </motion.button>
            </div>

            {/* Total Debt Summary Cards */}
            {!showCalculator && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Borrowed", value: `₹${totalPrincipal.toLocaleString()}`, color: "text-foreground" },
                        { label: "Remaining", value: `₹${totalRemaining.toLocaleString()}`, color: "text-rose-500" },
                        { label: "Monthly EMI", value: `₹${totalMonthlyEMI.toLocaleString()}`, color: "text-indigo-500" },
                        { label: "Debt Ratio", value: `${((totalRemaining / totalPrincipal) * 100).toFixed(0)}%`, color: "text-muted-foreground" }
                    ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-white/5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</div>
                            <div className={cn("text-lg font-black", stat.color)}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* EMI Calculator Section */}
            <AnimatePresence mode="wait">
                {showCalculator ? (
                    <motion.div
                        key="calculator"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Loan Amount</label>
                                <input
                                    type="number"
                                    value={calcData.principal}
                                    onChange={(e) => setCalcData({ ...calcData, principal: e.target.value })}
                                    className="w-full px-4 py-3 bg-muted/40 border border-white/5 rounded-xl outline-none text-sm focus:border-indigo-500/50 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Interest (%)</label>
                                <input
                                    type="number"
                                    value={calcData.interestRate}
                                    onChange={(e) => setCalcData({ ...calcData, interestRate: e.target.value })}
                                    className="w-full px-4 py-3 bg-muted/40 border border-white/5 rounded-xl outline-none text-sm focus:border-indigo-500/50 transition-all font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Months</label>
                                <input
                                    type="number"
                                    value={calcData.tenureMonths}
                                    onChange={(e) => setCalcData({ ...calcData, tenureMonths: e.target.value })}
                                    className="w-full px-4 py-3 bg-muted/40 border border-white/5 rounded-xl outline-none text-sm focus:border-indigo-500/50 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="p-8 rounded-3xl bg-indigo-600 text-white text-center shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Calculator className="w-24 h-24" /></div>
                            <div className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">Calculated Installment</div>
                            <div className="text-5xl font-black mb-4 flex items-center justify-center gap-2">
                                <span className="text-2xl font-bold opacity-50">₹</span>
                                {calculateEMI().toLocaleString()}
                            </div>
                            <div className="inline-flex gap-4 p-2 px-4 rounded-full bg-black/10 text-[10px] font-bold uppercase tracking-widest">
                                <span>Total Payable: ₹{(calculateEMI() * parseFloat(calcData.tenureMonths)).toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="loans"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                    >
                        {loans.map((loan, index) => {
                            const percentagePaid = ((loan.principal - loan.remainingAmount) / loan.principal) * 100;
                            const monthsLeft = Math.ceil(loan.remainingAmount / loan.emiAmount);

                            return (
                                <div key={index} className="p-5 rounded-2xl border border-white/5 bg-muted/20 hover:bg-muted/30 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-white/5 shadow-inner">
                                                {getLoanIcon(loan.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-foreground flex items-center gap-2">
                                                    {loan.name}
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-black uppercase tracking-widest">{loan.interestRate}% APR</span>
                                                </h3>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {monthsLeft} Monthly Dues Left</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase text-rose-500/60 tracking-widest mb-1 leading-none">Monthly EMI</div>
                                            <div className="text-xl font-black text-rose-500">₹{loan.emiAmount.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-tighter">
                                                <span className="text-muted-foreground">Repayment Progress</span>
                                                <span className="text-foreground">₹{(loan.principal - loan.remainingAmount).toLocaleString()} Paid</span>
                                            </div>
                                            <Progress
                                                value={percentagePaid}
                                                className="h-2 bg-muted/50"
                                                indicatorClassName="bg-indigo-500"
                                            />
                                            <div className="flex justify-between items-center text-[8px] font-black text-muted-foreground tracking-widest uppercase">
                                                <span>{percentagePaid.toFixed(1)}% Finished</span>
                                                <span>₹{loan.remainingAmount.toLocaleString()} Outstanding</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                                            <div className="text-center p-2 rounded-xl bg-background/50">
                                                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Interest Saved</div>
                                                <div className="text-xs font-black text-emerald-500">Eligible</div>
                                            </div>
                                            <div className="text-center p-2 rounded-xl bg-background/50">
                                                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Loan</div>
                                                <div className="text-xs font-black">₹{loan.principal.toLocaleString()}</div>
                                            </div>
                                            <div className="text-center p-2 rounded-xl bg-background/50">
                                                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Ends In</div>
                                                <div className="text-xs font-black text-blue-500">{new Date(loan.endDate).getFullYear()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 p-3 bg-muted/10 border border-white/5 rounded-xl flex items-start gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Info className="w-3.5 h-3.5 mt-0.5" />
                EMI predictions are based on standard reducing balance calculation methods.
            </div>
        </div>
    );
}
