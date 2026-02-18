"use client";

import { useState } from "react";
import { CreditScoreData } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";
import {
    Zap, Info, TrendingUp, AlertTriangle, CheckCircle2,
    Shield, Clock, CreditCard, Search, ArrowRight, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

function calculateCreditScore(data: CreditScoreData["factors"]): number {
    const paymentWeight = 0.35;
    const utilizationWeight = 0.30;
    const ageWeight = 0.15;
    const mixWeight = 0.10;
    const inquiryWeight = 0.10;

    const paymentScore = (data.paymentHistory / 100) * 350;
    const utilization = data.creditUtilization;
    const utilizationScore = utilization <= 30 ? 300 : Math.max(0, 300 - ((utilization - 30) * 4));
    const ageScore = Math.min(150, (data.creditAge / 120) * 150);
    const mixScore = (data.creditMix / 100) * 100;
    const inquiryScore = Math.max(0, 100 - (data.recentInquiries * 20));

    const totalScore = Math.round(300 + paymentScore + utilizationScore + ageScore + mixScore + inquiryScore);
    return Math.min(900, Math.max(300, totalScore));
}

export default function CreditScoreSimulator() {
    const [factors, setFactors] = useState<CreditScoreData["factors"]>({
        paymentHistory: 90,
        creditUtilization: 30,
        creditAge: 36,
        creditMix: 70,
        recentInquiries: 2,
    });

    const score = calculateCreditScore(factors);

    const getScoreStyles = (score: number) => {
        if (score >= 750) return { color: "text-emerald-500", bg: "bg-emerald-500", label: "Excellent", description: "You're in the top tier of creditworthiness." };
        if (score >= 650) return { color: "text-blue-500", bg: "bg-blue-500", label: "Good", description: "You have a strong credit profile." };
        if (score >= 550) return { color: "text-amber-500", bg: "bg-amber-500", label: "Fair", description: "There's room for improvement." };
        return { color: "text-rose-500", bg: "bg-rose-500", label: "Poor", description: "Your credit health needs immediate attention." };
    };

    const styles = getScoreStyles(score);

    const getTips = () => {
        const tips = [];
        if (factors.paymentHistory < 95) tips.push({ icon: <Clock className="w-4 h-4 text-amber-500" />, text: "Automate EMI payments to reach 100% on-time history." });
        if (factors.creditUtilization > 30) tips.push({ icon: <CreditCard className="w-4 h-4 text-rose-500" />, text: "Pay down balances to keep utilization below 30%." });
        if (factors.recentInquiries > 3) tips.push({ icon: <Search className="w-4 h-4 text-rose-500" />, text: "Avoid applying for new credit for at least 6 months." });
        return tips;
    };

    const factorSections = [
        { key: "paymentHistory", label: "Payment History", sub: "35% weight", icon: <Clock className="w-4 h-4" />, min: 0, max: 100, unit: "%" },
        { key: "creditUtilization", label: "Utilization", sub: "30% weight", icon: <CreditCard className="w-4 h-4" />, min: 0, max: 100, unit: "%" },
        { key: "creditAge", label: "History Age", sub: "15% weight", icon: <Clock className="w-4 h-4" />, min: 0, max: 120, unit: " mo" },
        { key: "creditMix", label: "Credit Mix", sub: "10% weight", icon: <Shield className="w-4 h-4" />, min: 0, max: 100, unit: "%" },
        { key: "recentInquiries", label: "Inquiries", sub: "10% weight", icon: <Search className="w-4 h-4" />, min: 0, max: 10, unit: "" },
    ];

    return (
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-foreground">Score Intelligence</h2>
                    <p className="text-xs text-muted-foreground">Estimate your CIBIL health</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Score Meter Side */}
                <div className="lg:w-1/2 space-y-6">
                    <div className={cn("p-10 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-center transition-colors duration-500", styles.bg, "bg-opacity-10 border border-white/5")}>
                        <div className="absolute top-0 left-0 w-full h-1 opacity-20 bg-white" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Estimated CIBIL Score</div>

                        <motion.div
                            key={score}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn("text-8xl font-black tracking-tighter mb-2", styles.color)}
                        >
                            {score}
                        </motion.div>

                        <div className={cn("text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 mb-4", styles.color)}>
                            {styles.label}
                        </div>

                        <p className="text-sm text-muted-foreground font-medium max-w-[200px]">
                            {styles.description}
                        </p>

                        <div className="mt-8 w-full space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-muted-foreground/50">
                                <span>300</span>
                                <span>900</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((score - 300) / 600) * 100}%` }}
                                    className={cn("h-full", styles.bg)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-muted/30 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            Optimization Steps
                        </h3>
                        <div className="space-y-3">
                            {getTips().map((tip, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-xl border border-white/5 text-xs font-medium">
                                    <div className="mt-0.5">{tip.icon}</div>
                                    {tip.text}
                                </div>
                            ))}
                            {getTips().length === 0 && (
                                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-xs font-bold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Your credit habits are benchmark quality!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sliders Side */}
                <div className="lg:w-1/2 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Variable Factors
                    </h3>

                    <div className="space-y-5">
                        {factorSections.map((f) => (
                            <div key={f.key} className="space-y-3 group">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                            {f.icon}
                                            {f.label}
                                        </div>
                                        <div className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest ml-6">
                                            {f.sub}
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-primary">
                                        {(factors as any)[f.key]}{f.unit}
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min={f.min}
                                    max={f.max}
                                    value={(factors as any)[f.key]}
                                    onChange={(e) => setFactors({ ...factors, [f.key]: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary group-hover:accent-emerald-500 transition-all"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                        <Info className="w-4 h-4 text-primary mt-0.5" />
                        <p className="text-[10px] text-primary/70 leading-relaxed font-bold uppercase tracking-tighter">
                            This simulator uses a proprietary algorithm inspired by CIBIL 3.0 models. Actual scores may vary based on lender-specific weightage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
