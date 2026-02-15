"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculateFinancialScore } from "@/lib/scoringEngine";
import { compareTaxRegimes } from "@/lib/taxEngine";
import { detectFinancialRisks } from "@/lib/riskEngine";
import type { FinancialAlert } from "@/lib/riskEngine";
import type { ScoringResult } from "@/lib/scoringEngine";
import type { TaxComparisonResult } from "@/lib/taxEngine";
import { useTheme } from "../components/ThemeProvider";
import { db } from "@/firebase/config";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import type { Transaction, FinancialGoal } from "@/lib/types";

// ShadCN UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Info, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, DollarSign, Wallet } from "lucide-react";

import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const USER_ID = "demo-user";

export default function Dashboard() {
    const { theme } = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // State for calculated metrics
    const [scoreResult, setScoreResult] = useState<ScoringResult | null>(null);
    const [prevScoreResult, setPrevScoreResult] = useState<ScoringResult | null>(null);
    const [taxComparison, setTaxComparison] = useState<TaxComparisonResult | null>(null);
    const [riskAlerts, setRiskAlerts] = useState<FinancialAlert[]>([]);
    const [emergencyFund, setEmergencyFund] = useState(0);

    // State for charts
    const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [monthlyMetrics, setMonthlyMetrics] = useState({ income: 0, expenses: 0, savings: 0 });

    useEffect(() => {
        const goalsUnsubscribe = onSnapshot(collection(db, `users/${USER_ID}/financialGoals`), (snapshot) => {
            snapshot.forEach(doc => {
                const data = doc.data() as FinancialGoal;
                if (data.name === "Emergency Fund") {
                    setEmergencyFund(data.currentAmount);
                }
            });
        });

        const q = query(
            collection(db, `users/${USER_ID}/transactions`),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTransactions: Transaction[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                fetchedTransactions.push({
                    amount: data.amount,
                    type: data.type,
                    category: data.category,
                    description: data.description,
                    date: data.date instanceof Timestamp
                        ? data.date.toDate().toISOString().split('T')[0]
                        : data.date,
                });
            });
            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to transactions:", error);
            toast.error("Failed to load dashboard data.");
            setLoading(false);
        });

        return () => {
            unsubscribe();
            goalsUnsubscribe();
        };
    }, []);

    useEffect(() => {
        if (loading) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const prevDate = new Date();
        prevDate.setMonth(now.getMonth() - 1);
        const prevMonth = prevDate.getMonth();
        const prevYear = prevDate.getFullYear();

        const currentMonthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const prevMonthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === prevMonth && tDate.getFullYear() === prevYear;
        });

        const monthlyIncome = currentMonthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const monthlyExpenses = currentMonthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        const monthlySavings = monthlyIncome - monthlyExpenses;

        setMonthlyMetrics({ income: monthlyIncome, expenses: monthlyExpenses, savings: monthlySavings });

        const prevIncome = prevMonthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
        const prevExpenses = prevMonthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
        const prevSavings = prevIncome - prevExpenses;

        const categoryMap = new Map<string, number>();
        currentMonthTransactions.filter(t => t.type === "expense").forEach(t => {
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + t.amount);
        });

        const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#C9CBCF", "#FF6B6B", "#4ECDC4"];
        const newCategoryData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length]
        }));

        setIncomeExpenseData([
            { name: "Income", amount: monthlyIncome, fill: "#4CAF50" },
            { name: "Expenses", amount: monthlyExpenses, fill: "#f44336" },
            { name: "Savings", amount: monthlySavings, fill: "#2196F3" },
        ]);
        setCategoryData(newCategoryData);

        const DEMO_DEBT = 100000;
        const score = calculateFinancialScore({
            monthlyIncome: monthlyIncome || 1,
            totalExpenses: monthlyExpenses,
            savings: monthlySavings,
            emergencyFund: emergencyFund,
            debt: DEMO_DEBT,
        });
        setScoreResult(score);

        if (prevMonthTransactions.length > 0) {
            const prevScore = calculateFinancialScore({
                monthlyIncome: prevIncome || 1,
                totalExpenses: prevExpenses,
                savings: prevSavings,
                emergencyFund: emergencyFund,
                debt: DEMO_DEBT,
            });
            setPrevScoreResult(prevScore);
        } else {
            setPrevScoreResult(null);
        }

        const taxComp = compareTaxRegimes({
            annualIncome: monthlyIncome * 12,
            section80Deductions: 150000,
            isSalaried: true,
        });
        setTaxComparison(taxComp);

        const alerts = detectFinancialRisks({
            monthlyIncome: monthlyIncome || 1,
            monthlyExpenses: monthlyExpenses,
            monthlySavings: monthlySavings,
            emergencyFund: emergencyFund,
        });
        setRiskAlerts(alerts);

    }, [transactions, emergencyFund, loading]);

    const textColor = theme === 'dark' ? '#E5E7EB' : '#374151';
    const gridColor = theme === 'dark' ? '#374151' : '#E5E7EB';
    const tooltipBg = theme === 'dark' ? '#1F2937' : '#FFFFFF';

    const getScoreReasons = (breakdown: ScoringResult['breakdown']) => {
        const reasons = [];
        if (breakdown.savingsScore >= 80) reasons.push("✅ Excellent savings rate.");
        else if (breakdown.savingsScore < 50) reasons.push("⚠️ Savings rate is below recommended 20%.");
        if (breakdown.emergencyScore >= 80) reasons.push("✅ Emergency fund is well-stocked.");
        else if (breakdown.emergencyScore < 50) reasons.push("⚠️ Emergency fund coverage is low.");
        if (breakdown.burnRateScore < 50) reasons.push("⚠️ Expenses are consuming too much income.");
        if (reasons.length === 0) reasons.push("Financial metrics are generally balanced.");
        return reasons.slice(0, 3);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/30 dark:bg-background p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <section className="flex flex-col items-center py-4 space-y-4">
                        <Skeleton className="h-12 w-32" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-48" />
                    </section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 dark:bg-background transition-colors duration-300 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* SECTION 1: HERO (Centered) */}
                <section className="flex flex-col items-center justify-center space-y-4 py-4">
                    {scoreResult && (
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{scoreResult.score}</h1>
                            <Badge
                                variant={scoreResult.riskLevel === 'Low' ? 'secondary' : scoreResult.riskLevel === 'Moderate' ? 'outline' : 'destructive'}
                                className={`px-4 py-1 text-sm font-semibold uppercase tracking-wider 
                                    ${scoreResult.riskLevel === 'Low' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' :
                                        scoreResult.riskLevel === 'Moderate' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400' :
                                            'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'}`}
                            >
                                {scoreResult.riskLevel} Risk
                            </Badge>
                            <p className="text-muted-foreground text-sm font-medium">Overall Financial Stability</p>
                        </div>
                    )}
                </section>

                {/* SECTION 2: INTELLIGENCE GRID */}
                {scoreResult && (
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Why This Score */}
                        <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Info className="h-5 w-5 text-indigo-500" />
                                    Why This Score?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {getScoreReasons(scoreResult.breakdown).map((reason, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-muted-foreground">
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Recommended Actions */}
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    Recommended Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {scoreResult.improvementSuggestions.length > 0 ? (
                                        scoreResult.improvementSuggestions.slice(0, 3).map((suggestion, idx) => (
                                            <li key={idx} className="flex items-start text-sm text-muted-foreground">
                                                <span className="mr-2 mt-0.5 text-emerald-500">➜</span>
                                                {suggestion}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-muted-foreground italic">Maintain your current financial habits!</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* SECTION 3: TREND & METRICS */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monthly Trend */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                Monthly Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {prevScoreResult ? (
                                <div className="flex items-center justify-between">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-1">Last Month</div>
                                        <div className="text-2xl font-bold text-muted-foreground/70">{prevScoreResult.score}</div>
                                    </div>
                                    <div className="h-8 w-px bg-border mx-4"></div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-1">Current</div>
                                        <div className="text-2xl font-bold text-foreground">{scoreResult?.score}</div>
                                    </div>
                                    <div className="h-8 w-px bg-border mx-4"></div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-1">Change</div>
                                        {scoreResult && (
                                            <div className={`text-xl font-bold ${scoreResult.score - prevScoreResult.score >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {scoreResult.score - prevScoreResult.score >= 0 ? '+' : ''}
                                                {((scoreResult.score - prevScoreResult.score) / prevScoreResult.score * 100).toFixed(1)}%
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full py-2">
                                    <span className="text-sm text-muted-foreground italic">No previous month data available.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Financial Summary */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Wallet className="h-5 w-5 text-purple-500" />
                                Monthly Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Income</span>
                                    <div className="text-xl font-bold text-green-600 dark:text-green-400">₹{monthlyMetrics.income.toLocaleString()}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expenses</span>
                                    <div className="text-xl font-bold text-red-600 dark:text-red-400">₹{monthlyMetrics.expenses.toLocaleString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* SECTION 4: DETAILED ANALYTICS (Below Fold) */}
                <section className="space-y-6 pt-8 border-t border-border">
                    <h3 className="text-xl font-bold text-foreground">Detailed Analytics</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Income vs Expenses</CardTitle>
                            </CardHeader>
                            <CardContent className="h-64">
                                <ResponsiveContainer width="100%" height="100%" id="income-expense-chart" aria-label="Income versus Expenses Bar Chart">
                                    <BarChart data={incomeExpenseData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                        <XAxis dataKey="name" stroke={textColor} axisLine={false} tickLine={false} />
                                        <YAxis stroke={textColor} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: tooltipBg, color: textColor, borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                        <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Category Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-64">
                                {categoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%" id="category-breakdown-chart" aria-label="Expense Categories Pie Chart">
                                        <PieChart>
                                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" role="img" aria-label="Category allocation pie chart">
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: tooltipBg, color: textColor, borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed text-sm">
                                        No spending data available.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tax & Alerts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tax Regime</CardTitle>
                                <CardDescription>Recommended: {taxComparison?.recommendedRegime}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {taxComparison && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span>Old Regime: ₹{taxComparison.oldRegime.totalTax.toLocaleString()}</span>
                                            <span>New Regime: ₹{taxComparison.newRegime.totalTax.toLocaleString()}</span>
                                        </div>
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded text-center text-sm text-green-700 dark:text-green-300 font-medium">
                                            Save ₹{taxComparison.savings.toLocaleString()} annually
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Alerts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {riskAlerts.length === 0 ? (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-sm font-medium">No risks detected.</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {riskAlerts.map((alert, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                                <AlertTriangle className="h-4 w-4 mt-0.5" />
                                                <span>{alert.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>

            </div>
        </div>
    );
}
