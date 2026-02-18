"use client";

import { useState } from "react";
import { Investment } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
    TrendingUp, TrendingDown, Briefcase, Plus, X,
    ChevronRight, Wallet, PieChart, Activity, Calendar,
    BarChart3, Globe, ShieldCheck, Gem
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_INVESTMENTS: Investment[] = [
    {
        name: "HDFC Mid Cap Fund",
        type: "mutual-funds",
        investedAmount: 150000,
        currentValue: 182000,
        purchaseDate: "2023-01-15",
        returns: 21.33,
    },
    {
        name: "FD - SBI 7.5%",
        type: "fixed-deposit",
        investedAmount: 200000,
        currentValue: 215000,
        purchaseDate: "2023-06-01",
        maturityDate: "2025-06-01",
        returns: 7.5,
    },
    {
        name: "Gold ETF",
        type: "gold",
        investedAmount: 50000,
        currentValue: 56500,
        purchaseDate: "2024-01-01",
        returns: 13.0,
    },
];

export default function InvestmentTracker() {
    const [investments, setInvestments] = useState<Investment[]>(DEMO_INVESTMENTS);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newInvestment, setNewInvestment] = useState({
        name: "",
        type: "mutual-funds" as Investment["type"],
        investedAmount: "",
        currentValue: "",
        purchaseDate: "",
    });

    const addInvestment = () => {
        if (newInvestment.name && newInvestment.investedAmount && newInvestment.currentValue) {
            const invested = parseFloat(newInvestment.investedAmount);
            const current = parseFloat(newInvestment.currentValue);
            const returns = ((current - invested) / invested) * 100;

            setInvestments([
                ...investments,
                {
                    name: newInvestment.name,
                    type: newInvestment.type,
                    investedAmount: invested,
                    currentValue: current,
                    purchaseDate: newInvestment.purchaseDate || new Date().toISOString().split("T")[0],
                    returns: parseFloat(returns.toFixed(2)),
                },
            ]);
            setNewInvestment({
                name: "",
                type: "mutual-funds",
                investedAmount: "",
                currentValue: "",
                purchaseDate: "",
            });
            setShowAddForm(false);
        }
    };

    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalGain = totalCurrent - totalInvested;
    const totalReturns = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";

    const getTypeIcon = (type: Investment["type"]) => {
        switch (type) {
            case 'stocks': return <TrendingUp className="w-5 h-5 text-indigo-500" />;
            case 'mutual-funds': return <BarChart3 className="w-5 h-5 text-blue-500" />;
            case 'fixed-deposit': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
            case 'gold': return <Gem className="w-5 h-5 text-amber-500" />;
            case 'crypto': return <Globe className="w-5 h-5 text-purple-500" />;
            default: return <Briefcase className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">Wealth Portfolio</h2>
                        <p className="text-xs text-muted-foreground">Asset allocation & real-time performance</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        showAddForm ? "bg-muted text-foreground" : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    )}
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAddForm ? "Cancel" : "Add Asset"}
                </motion.button>
            </div>

            {/* Portfolio Summary Widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Invested", value: `₹${totalInvested.toLocaleString()}`, icon: <Wallet className="w-3 h-3" />, color: "text-foreground" },
                    { label: "Current", value: `₹${totalCurrent.toLocaleString()}`, icon: <PieChart className="w-3 h-3" />, color: "text-blue-500" },
                    { label: "Net Gain", value: `${totalGain >= 0 ? "+" : ""}₹${totalGain.toLocaleString()}`, icon: totalGain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />, color: totalGain >= 0 ? "text-emerald-500" : "text-rose-500" },
                    { label: "Yield", value: `${totalReturns}%`, icon: <Activity className="w-3 h-3" />, color: parseFloat(totalReturns) >= 0 ? "text-emerald-500" : "text-rose-500" }
                ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-white/5">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                            {stat.icon}
                            {stat.label}
                        </div>
                        <div className={cn("text-lg font-black", stat.color)}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Add Asset Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 bg-muted/50 rounded-2xl border border-white/5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Asset Name</label>
                                    <input
                                        type="text"
                                        value={newInvestment.name}
                                        onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                                        placeholder="e.g., Apple Stocks"
                                        className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Asset Type</label>
                                    <select
                                        value={newInvestment.type}
                                        onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value as Investment["type"] })}
                                        className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-blue-500/50 transition-all"
                                    >
                                        <option value="stocks">Stocks</option>
                                        <option value="mutual-funds" selected>Mutual Funds</option>
                                        <option value="fixed-deposit">Fixed Deposit</option>
                                        <option value="gold">Gold</option>
                                        <option value="crypto">Crypto</option>
                                        <option value="ppf">PPF</option>
                                        <option value="nps">NPS</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Invested Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={newInvestment.investedAmount}
                                        onChange={(e) => setNewInvestment({ ...newInvestment, investedAmount: e.target.value })}
                                        placeholder="100000"
                                        className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Current Value (₹)</label>
                                    <input
                                        type="number"
                                        value={newInvestment.currentValue}
                                        onChange={(e) => setNewInvestment({ ...newInvestment, currentValue: e.target.value })}
                                        placeholder="120000"
                                        className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={addInvestment}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-600/10 hover:bg-blue-700 transition-all"
                            >
                                Track Performance
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Asset List */}
            <div className="space-y-3">
                {investments.map((investment, index) => {
                    const gain = investment.currentValue - investment.investedAmount;
                    const isProfit = gain >= 0;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 rounded-2xl border border-white/5 bg-muted/20 hover:bg-muted/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-white/5">
                                    {getTypeIcon(investment.type)}
                                </div>
                                <div>
                                    <h3 className="font-black text-foreground group-hover:text-blue-500 transition-colors">
                                        {investment.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        Since {new Date(investment.purchaseDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Buy Price</div>
                                    <div className="text-sm font-bold text-foreground">₹{investment.investedAmount.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Market Val</div>
                                    <div className="text-sm font-bold text-blue-500">₹{investment.currentValue.toLocaleString()}</div>
                                </div>
                                <div className="text-right col-span-2 md:col-span-1">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">Profit/Loss</div>
                                    <div className={cn("text-base font-black flex items-center justify-end gap-1", isProfit ? "text-emerald-500" : "text-rose-500")}>
                                        {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        ₹{Math.abs(gain).toLocaleString()}
                                        <span className="text-xs ml-1 opacity-70">({investment.returns}%)</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {investments.length === 0 && (
                <div className="py-20 text-center bg-muted/10 rounded-2xl border border-dashed border-white/5">
                    <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground italic">Portfolio is currently empty.</p>
                </div>
            )}
        </div>
    );
}
