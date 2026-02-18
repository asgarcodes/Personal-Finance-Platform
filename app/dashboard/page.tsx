"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend,
    ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { calculateFinancialScore } from "@/lib/scoringEngine";
import { compareTaxRegimes } from "@/lib/taxEngine";
import { detectFinancialRisks } from "@/lib/riskEngine";
import type { FinancialAlert } from "@/lib/riskEngine";
import type { ScoringResult } from "@/lib/scoringEngine";
import type { TaxComparisonResult } from "@/lib/taxEngine";
import { useTheme } from "../components/ThemeProvider";
import { db } from "@/firebase/config";
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc } from "firebase/firestore";
import type { Transaction, FinancialGoal } from "@/lib/types";
import { motion, AnimatePresence } from "motion/react";

// Components
import dynamic from "next/dynamic";

// Optimized Dynamic Imports (Lazy Loading) - Speeds up compilation & initial render
const TransactionForm = dynamic(() => import("../components/TransactionForm"), {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full rounded-2xl" />
});
const FinancialWizard = dynamic(() => import("../components/FinancialWizard"), { ssr: false });
const InvestmentTracker = dynamic(() => import("../components/InvestmentTracker"), { ssr: false });
const CreditScoreSimulator = dynamic(() => import("../components/CreditScoreSimulator"), { ssr: false });
const LoanManager = dynamic(() => import("../components/LoanManager"), { ssr: false });
const ITRAssistant = dynamic(() => import("../components/ITRAssistant"), { ssr: false });
const TaxReminders = dynamic(() => import("../components/TaxReminders"), { ssr: false });
const GoalsTracker = dynamic(() => import("../components/GoalsTracker"), { ssr: false });

// shadcn/ui Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Radix UI
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Separator from "@radix-ui/react-separator";
import * as Dialog from "@radix-ui/react-dialog";

// Lucide icons
import {
    Info, AlertTriangle, TrendingUp, TrendingDown,
    CheckCircle2, Wallet, BarChart2, PieChart as PieIcon,
    ArrowLeft, Home, Shield, Target, Zap, RefreshCw,
    ChevronUp, ChevronDown, Plus, Trash2, X, Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useAuth } from "../components/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

const CHART_COLORS = [
    "#7c5cfc", "#60a5fa", "#34d399", "#f59e0b",
    "#f43f5e", "#a78bfa", "#38bdf8", "#4ade80",
];

// Animated stat card component
function StatCard({
    label,
    value,
    icon,
    color,
    trend,
    delay = 0,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; label: string };
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <Card className="stat-card overflow-hidden relative border-0 shadow-sm">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{ background: `radial-gradient(circle at 80% 20%, ${color}, transparent 60%)` }}
                />
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: `${color}20`, color }}
                        >
                            {icon}
                        </div>
                        {trend && (
                            <div
                                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend.value >= 0
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    }`}
                            >
                                {trend.value >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {Math.abs(trend.value).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{label}</div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Score ring component
function ScoreRing({ score, riskLevel }: { score: number; riskLevel: string }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const color =
        riskLevel === "Low" ? "#10b981" :
            riskLevel === "Moderate" ? "#f59e0b" : "#f43f5e";

    return (
        <div className="relative w-36 h-36 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <motion.circle
                    cx="64" cy="64" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-3xl font-black"
                    style={{ color }}
                >
                    {score}
                </motion.div>
                <div className="text-xs text-muted-foreground font-medium">/ 100</div>
            </div>
        </div>
    );
}
export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showWizard, setShowWizard] = useState(false);

    const [scoreResult, setScoreResult] = useState<ScoringResult | null>(null);
    const [prevScoreResult, setPrevScoreResult] = useState<ScoringResult | null>(null);
    const [taxComparison, setTaxComparison] = useState<TaxComparisonResult | null>(null);
    const [riskAlerts, setRiskAlerts] = useState<FinancialAlert[]>([]);
    const [emergencyFund, setEmergencyFund] = useState(0);

    const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [monthlyMetrics, setMonthlyMetrics] = useState({ income: 0, expenses: 0, savings: 0 });
    const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (!user) return;

        const goalsUnsubscribe = onSnapshot(
            collection(db, `users/${user.uid}/financialGoals`),
            (snapshot) => {
                snapshot.forEach((doc) => {
                    const data = doc.data() as FinancialGoal;
                    if (data.name === "Emergency Fund" || data.category === "Emergency Fund") {
                        setEmergencyFund(data.currentAmount);
                    }
                });
            }
        );

        const q = query(collection(db, `users/${user.uid}/transactions`), orderBy("date", "desc"));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const fetched: Transaction[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    fetched.push({
                        id: doc.id,
                        amount: data.amount,
                        type: data.type,
                        category: data.category,
                        description: data.description,
                        date: data.date instanceof Timestamp
                            ? data.date.toDate().toISOString().split("T")[0]
                            : data.date,
                    });
                });
                setTransactions(fetched);
                setLoading(false);
            },
            (error) => {
                console.error("Error:", error);
                toast.error("Failed to load dashboard data.");
                setLoading(false);
            }
        );

        return () => { unsubscribe(); goalsUnsubscribe(); };
    }, [user, authLoading, router]);

    useEffect(() => {
        if (loading) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const prevDate = new Date();
        prevDate.setMonth(now.getMonth() - 1);
        const prevMonth = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();

        const currentTxns = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const prevTxns = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        });

        const income = currentTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const expenses = currentTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        const savings = income - expenses;
        setMonthlyMetrics({ income, expenses, savings });

        const prevIncome = prevTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const prevExpenses = prevTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        const prevSavings = prevIncome - prevExpenses;

        // Category breakdown
        const catMap = new Map<string, number>();
        currentTxns.filter((t) => t.type === "expense").forEach((t) => {
            catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
        });
        setCategoryData(
            Array.from(catMap.entries()).map(([name, value], i) => ({
                name, value, color: CHART_COLORS[i % CHART_COLORS.length],
            }))
        );

        setIncomeExpenseData([
            { name: "Income", amount: income, fill: "#10b981" },
            { name: "Expenses", amount: expenses, fill: "#f43f5e" },
            { name: "Savings", amount: Math.max(savings, 0), fill: "#7c5cfc" },
        ]);

        // Monthly trend (last 6 months)
        const trend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth();
            const y = d.getFullYear();
            const monthTxns = transactions.filter((t) => {
                const td = new Date(t.date);
                return td.getMonth() === m && td.getFullYear() === y;
            });
            const mIncome = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const mExpenses = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            trend.push({
                month: d.toLocaleString("default", { month: "short" }),
                income: mIncome,
                expenses: mExpenses,
                savings: mIncome - mExpenses,
            });
        }
        setMonthlyTrend(trend);

        // Scores
        const DEMO_DEBT = 100000;
        const currentScore = calculateFinancialScore({
            monthlyIncome: income || 1,
            totalExpenses: expenses,
            savings,
            emergencyFund,
            debt: DEMO_DEBT,
        });
        setScoreResult(currentScore);

        if (prevTxns.length > 0) {
            setPrevScoreResult(
                calculateFinancialScore({
                    monthlyIncome: prevIncome || 1,
                    totalExpenses: prevExpenses,
                    savings: prevSavings,
                    emergencyFund,
                    debt: DEMO_DEBT,
                })
            );
        } else {
            setPrevScoreResult(null);
        }

        setTaxComparison(
            compareTaxRegimes({
                annualIncome: (income || (transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0) / Math.max(transactions.length, 1))) * 12,
                section80Deductions: 150000,
                isSalaried: true,
            })
        );

        setRiskAlerts(
            detectFinancialRisks({
                monthlyIncome: income || 1,
                monthlyExpenses: expenses,
                monthlySavings: savings,
                emergencyFund,
            })
        );
    }, [transactions, emergencyFund, loading]);

    const handleDeleteTransaction = async (id: string) => {
        if (!confirm("Delete this transaction?")) return;
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
            toast.success("Transaction deleted");
        } catch (error) {
            toast.error("Failed to delete transaction");
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/login");
    };

    const isDark = theme === "dark";
    const textColor = isDark ? "#9ca3af" : "#6b7280";
    const gridColor = isDark ? "#1f2937" : "#f3f4f6";
    const tooltipBg = isDark ? "#111827" : "#ffffff";

    const scoreTrend =
        scoreResult && prevScoreResult
            ? ((scoreResult.score - prevScoreResult.score) / prevScoreResult.score) * 100
            : undefined;

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-64 rounded-2xl" />
                        <Skeleton className="h-64 rounded-2xl col-span-2" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Tooltip.Provider delayDuration={200}>
            <div className="min-h-screen bg-background transition-colors duration-300">
                {/* ── TOP NAV ── */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl"
                >
                    <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-2 cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">IQ</div>
                                    <span className="font-bold hidden sm:inline">FinanceIQ</span>
                                </motion.div>
                            </Link>
                            <Separator.Root orientation="vertical" className="h-5 w-px bg-border" />
                            <Link href="/">
                                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                                    <Home className="w-3 h-3" /> Home
                                </button>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSignOut}
                                className="text-xs font-bold text-muted-foreground hover:text-rose-500 transition-colors uppercase tracking-widest"
                            >
                                Sign Out
                            </button>
                            <Dialog.Root open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                <Dialog.Trigger asChild>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Entry</span>
                                    </motion.button>
                                </Dialog.Trigger>
                                <Dialog.Portal>
                                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
                                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4 animate-in zoom-in-95 duration-300">
                                        <div className="relative">
                                            <Dialog.Title className="sr-only">Add Transaction</Dialog.Title>
                                            <Dialog.Description className="sr-only">Enter details for a new income or expense entry.</Dialog.Description>
                                            <TransactionForm onAdd={() => setIsAddModalOpen(false)} />
                                            <Dialog.Close asChild>
                                                <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </Dialog.Close>
                                        </div>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>

                            <motion.button
                                onClick={() => setShowWizard(!showWizard)}
                                whileHover={{ scale: 1.05 }}
                                className={cn(
                                    "p-2 rounded-xl transition-all",
                                    showWizard ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Zap className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                    {/* ── WIZARD OVERLAY ── */}
                    <AnimatePresence>
                        {showWizard && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <FinancialWizard transactions={transactions} />
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => setShowWizard(false)}
                                        className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 uppercase tracking-widest"
                                    >
                                        Close Wizard <ChevronUp className="w-3 h-3" />
                                    </button>
                                </div>
                                <Separator.Root className="my-8 h-px bg-border" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── HEADER ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                        <div>
                            <h1 className="text-3xl font-black text-foreground tracking-tight">Financial Intelligence</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                Real-time insights for {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-semibold">
                                <Download className="w-4 h-4" /> Export
                            </button>
                        </div>
                    </motion.div>

                    {/* ── STATS ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Monthly Income"
                            value={`₹${monthlyMetrics.income.toLocaleString()}`}
                            icon={<TrendingUp className="w-5 h-5" />}
                            color="#10b981"
                        />
                        <StatCard
                            label="Monthly Expenses"
                            value={`₹${monthlyMetrics.expenses.toLocaleString()}`}
                            icon={<TrendingDown className="w-5 h-5" />}
                            color="#f43f5e"
                        />
                        <StatCard
                            label="Net Savings"
                            value={`₹${monthlyMetrics.savings.toLocaleString()}`}
                            icon={<Wallet className="w-5 h-5" />}
                            color="#7c5cfc"
                        />
                        <StatCard
                            label="Health Score"
                            value={scoreResult ? `${scoreResult.score}/100` : "—"}
                            icon={<Shield className="w-5 h-5" />}
                            color="#f59e0b"
                            trend={scoreTrend !== undefined ? { value: scoreTrend, label: "vs last month" } : undefined}
                        />
                    </div>

                    {/* ── TABS ── */}
                    <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                        <Tabs.List className="flex gap-1 p-1 bg-muted/50 backdrop-blur-md rounded-2xl w-fit mb-8 border border-white/5">
                            {[
                                { id: "overview", label: "Overview", icon: <BarChart2 className="w-4 h-4" /> },
                                { id: "analytics", label: "Intelligence", icon: <PieIcon className="w-4 h-4" /> },
                                { id: "planning", label: "Growth & Goals", icon: <Target className="w-4 h-4" /> },
                                { id: "tax", label: "Tax & Risk", icon: <Shield className="w-4 h-4" /> },
                            ].map((tab) => (
                                <Tabs.Trigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-muted-foreground transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xl data-[state=active]:scale-105"
                                >
                                    {tab.icon}
                                    {tab.label}
                                </Tabs.Trigger>
                            ))}
                        </Tabs.List>

                        {/* OVERVIEW */}
                        <Tabs.Content value="overview">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Score & Recommendations */}
                                <div className="space-y-8">
                                    <Card className="border-0 shadow-xl bg-gradient-to-b from-card to-muted/20">
                                        <CardHeader>
                                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Financial Health</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center pb-8">
                                            {scoreResult && (
                                                <>
                                                    <ScoreRing score={scoreResult.score} riskLevel={scoreResult.riskLevel} />
                                                    <div className="mt-6 text-center">
                                                        <div className="text-xl font-black text-foreground capitalize">{scoreResult.riskLevel} Risk</div>
                                                        <p className="text-xs text-muted-foreground px-4 mt-1">Based on your savings rate and emergency buffer</p>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-xl overflow-hidden">
                                        <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Strategic Insight</span>
                                            <Zap className="w-3.5 h-3.5 text-primary" />
                                        </div>
                                        <CardContent className="p-6">
                                            {scoreResult?.improvementSuggestions.slice(0, 2).map((s, i) => (
                                                <div key={i} className="flex gap-4 mb-4 last:mb-0">
                                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">{s}</p>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Main Chart Area */}
                                <div className="lg:col-span-2 space-y-8">
                                    <Card className="border-0 shadow-xl">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Cashflow Trend</CardTitle>
                                                <CardDescription>Income vs Expenses (6 Months)</CardDescription>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Income
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                                    <div className="w-2 h-2 rounded-full bg-rose-500" /> Expenses
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={monthlyTrend}>
                                                    <defs>
                                                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} stroke={textColor} tick={{ fontSize: 10, fontWeight: 700 }} />
                                                    <YAxis axisLine={false} tickLine={false} stroke={textColor} tick={{ fontSize: 10, fontWeight: 700 }} />
                                                    <ChartTooltip
                                                        contentStyle={{
                                                            backgroundColor: tooltipBg,
                                                            borderRadius: '12px',
                                                            border: 'none',
                                                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fill="url(#colorInc)" />
                                                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fill="url(#colorExp)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    {/* Recent Ledger */}
                                    <Card className="border-0 shadow-xl overflow-hidden">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
                                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Recent Ledger</CardTitle>
                                            <button className="text-[10px] font-black uppercase text-primary hover:underline">View All Records</button>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                            <th className="px-6 py-3">Description</th>
                                                            <th className="px-6 py-3">Category</th>
                                                            <th className="px-6 py-3">Amount</th>
                                                            <th className="px-6 py-3 text-right pr-10">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {transactions.slice(0, 5).map((txn, i) => (
                                                            <motion.tr
                                                                key={txn.id || i}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="group border-b border-border hover:bg-muted/20 transition-colors"
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-foreground line-clamp-1">{txn.description}</span>
                                                                        <span className="text-[10px] text-muted-foreground uppercase">{txn.date}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest h-5 bg-background border-border/50">
                                                                        {txn.category}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={cn("text-sm font-black", txn.type === 'income' ? "text-emerald-500" : "text-rose-500")}>
                                                                        {txn.type === 'income' ? "+" : "-"}₹{txn.amount.toLocaleString()}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right pr-6">
                                                                    <button
                                                                        onClick={() => txn.id && handleDeleteTransaction(txn.id)}
                                                                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all text-muted-foreground"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </motion.tr>
                                                        ))}
                                                        {transactions.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground font-medium">
                                                                    No records found. Click &quot;Add Entry&quot; to begin.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </Tabs.Content>

                        {/* INTELLIGENCE */}
                        <Tabs.Content value="analytics">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card className="border-0 shadow-xl h-fit">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Allocation Pulse</CardTitle>
                                        <CardDescription>Current month spend breakdown</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip />
                                                <Legend iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <div className="space-y-8">
                                    <InvestmentTracker />
                                    <CreditScoreSimulator />
                                </div>
                            </div>
                        </Tabs.Content>

                        {/* PLANNING */}
                        <Tabs.Content value="planning">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <GoalsTracker />
                                </div>
                                <div className="space-y-8">
                                    <LoanManager />
                                    <Card className="border-0 shadow-xl bg-indigo-600 text-white overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Zap className="w-32 h-32" />
                                        </div>
                                        <CardContent className="p-8 relative z-10">
                                            <h3 className="text-xl font-bold mb-2">Automate Your Savings</h3>
                                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                                Our AI detected you have an average of ₹12,000 left at month-end. Start an SIP to grow this by 12% annually.
                                            </p>
                                            <button className="px-6 py-2.5 rounded-xl bg-white text-indigo-600 font-bold text-sm shadow-xl">Explore SIPs</button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </Tabs.Content>

                        {/* TAX & COMPLIANCE */}
                        <Tabs.Content value="tax">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <ITRAssistant />
                                </div>
                                <div>
                                    <TaxReminders />
                                </div>
                            </div>
                        </Tabs.Content>
                    </Tabs.Root>
                </div>
            </div>
        </Tooltip.Provider>
    );
}
