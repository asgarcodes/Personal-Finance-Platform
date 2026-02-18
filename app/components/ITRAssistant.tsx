"use client";

import { useState } from "react";
import { ITRData } from "@/lib/types";
import { compareTaxRegimes } from "@/lib/taxEngine";
import { motion } from "motion/react";
import {
    Calculator, Receipt, Info, Sparkles, TrendingDown,
    ShieldCheck, Calendar, ArrowRight, Download, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ITRAssistant() {
    const [itrData, setItrData] = useState<ITRData>({
        financialYear: "2024-25",
        status: "in-progress",
        grossIncome: 1200000,
        deductions: {
            section80C: 150000,
            section80D: 25000,
            homeLoan: 0,
            other: 0,
        },
        taxPaid: {
            tds: 95000,
            advanceTax: 0,
            selfAssessment: 0,
        },
    });

    const totalDeductions = Object.values(itrData.deductions).reduce((a, b) => a + b, 0);
    const totalTaxPaid = Object.values(itrData.taxPaid).reduce((a, b) => a + b, 0);

    const taxComparison = compareTaxRegimes({
        annualIncome: itrData.grossIncome,
        section80Deductions: totalDeductions,
        isSalaried: true,
    });

    const taxLiability = taxComparison.recommendedRegime === "Old"
        ? taxComparison.oldRegime.totalTax
        : taxComparison.newRegime.totalTax;

    const refundOrPayable = totalTaxPaid - taxLiability;

    const statusConfig = {
        "not-started": { color: "bg-slate-500", label: "Pending" },
        "in-progress": { color: "bg-amber-500", label: "Computing" },
        "filed": { color: "bg-blue-500", label: "Filed" },
        "verified": { color: "bg-emerald-500", label: "Success" },
    };

    return (
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">Tax Assistant</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> AY {itrData.financialYear} Assessment
                        </p>
                    </div>
                </div>
                <Badge className={cn("text-[10px] font-black uppercase tracking-widest", statusConfig[itrData.status].color)}>
                    {statusConfig[itrData.status].label}
                </Badge>
            </div>

            {/* Smart Summary Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Gross Income", value: `₹${itrData.grossIncome.toLocaleString()}`, color: "from-indigo-600 to-indigo-700" },
                    { label: "Final Tax", value: `₹${Math.round(taxLiability).toLocaleString()}`, color: "from-rose-600 to-rose-700", sub: `${taxComparison.recommendedRegime} Regime` },
                    { label: refundOrPayable >= 0 ? "Potential Refund" : "Payment Due", value: `₹${Math.abs(Math.round(refundOrPayable)).toLocaleString()}`, color: refundOrPayable >= 0 ? "from-emerald-600 to-emerald-700" : "from-amber-600 to-amber-700" }
                ].map((card, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        className={cn("p-6 rounded-2xl bg-gradient-to-br text-white shadow-lg", card.color)}
                    >
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{card.label}</div>
                        <div className="text-2xl font-black">{card.value}</div>
                        {card.sub && <div className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-tighter">{card.sub}</div>}
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Inputs Side */}
                <div className="space-y-6">
                    <div className="p-6 bg-muted/30 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            Income & Credits
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Total Annual Income</label>
                                <input
                                    type="number"
                                    value={itrData.grossIncome}
                                    onChange={(e) => setItrData({ ...itrData, grossIncome: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-orange-500/50 transition-all font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">80C Savings</label>
                                    <input
                                        type="number"
                                        value={itrData.deductions.section80C}
                                        onChange={(e) => setItrData({ ...itrData, deductions: { ...itrData.deductions, section80C: parseFloat(e.target.value) || 0 } })}
                                        className="w-full px-3 py-2 bg-background border border-white/5 rounded-lg outline-none text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Medical (80D)</label>
                                    <input
                                        type="number"
                                        value={itrData.deductions.section80D}
                                        onChange={(e) => setItrData({ ...itrData, deductions: { ...itrData.deductions, section80D: parseFloat(e.target.value) || 0 } })}
                                        className="w-full px-3 py-2 bg-background border border-white/5 rounded-lg outline-none text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4" />
                            Optimization Engine
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-foreground">Regime Recommendation</span>
                            <Badge className="bg-emerald-500 text-white border-0 font-black">{taxComparison.recommendedRegime} Regime</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            By sticking to the <span className="text-emerald-500 font-bold">{taxComparison.recommendedRegime}</span> path, you save approximately <span className="text-foreground font-black">₹{taxComparison.savings.toLocaleString()}</span> in pure tax liability.
                        </p>
                    </div>
                </div>

                {/* Ledger & Checklist Side */}
                <div className="space-y-6">
                    <div className="p-6 bg-muted/30 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Tax Credit Ledger
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: "TDS / TCS", key: "tds", value: itrData.taxPaid.tds },
                                { label: "Advance Tax", key: "advanceTax", value: itrData.taxPaid.advanceTax },
                                { label: "Self-Assessment", key: "selfAssessment", value: itrData.taxPaid.selfAssessment }
                            ].map((row) => (
                                <div key={row.key} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold text-muted-foreground">{row.label}</span>
                                    <input
                                        type="number"
                                        value={row.value}
                                        onChange={(e) => setItrData({ ...itrData, taxPaid: { ...itrData.taxPaid, [row.key]: parseFloat(e.target.value) || 0 } })}
                                        className="w-24 bg-transparent text-right font-black text-xs outline-none focus:text-orange-500 transition-colors"
                                    />
                                </div>
                            ))}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-emerald-500 font-black">
                                <span className="text-xs uppercase tracking-widest">Total Paid</span>
                                <span className="text-sm">₹{totalTaxPaid.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-orange-500/5 rounded-2xl border border-orange-500/10 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Filing Checklist
                        </h3>
                        <div className="space-y-2">
                            {[
                                "Verify AIS/TIS statement data",
                                "Reconcile TDS with Form 26AS",
                                "Upload missing 80C proofs",
                                "E-verify within 30 days"
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                                    <CheckCircle2 className="w-4 h-4 text-orange-500/40" />
                                    {step}
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                            Export AIS Reconciliation Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] font-bold text-blue-500/70 uppercase tracking-widest leading-none">
                <Info className="w-3.5 h-3.5" />
                Computation based on FY 2024-25 Finance Bill slab rates
            </div>
        </div>
    );
}
