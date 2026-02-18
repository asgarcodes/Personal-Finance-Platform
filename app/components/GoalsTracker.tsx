"use client";

import { useState, useEffect } from "react";
import { FinancialGoal } from "@/lib/types";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Target, Shield, Plus, X, Pencil, ArrowUpRight, TrendingUp, Calendar, Trash2, ChevronRight, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GoalsTrackerProps {
    monthlyExpenses?: number;
}

const USER_ID = "demo-user";

export default function GoalsTracker({ monthlyExpenses = 0 }: GoalsTrackerProps) {
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [emergencyMonths, setEmergencyMonths] = useState(6);
    const [emergencyFundGoal, setEmergencyFundGoal] = useState<FinancialGoal | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [newGoal, setNewGoal] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
        category: "",
    });

    useEffect(() => {
        const q = query(collection(db, `users/${USER_ID}/financialGoals`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedGoals: FinancialGoal[] = [];
            let efGoal: FinancialGoal | null = null;

            snapshot.forEach((doc) => {
                const data = doc.data() as FinancialGoal;
                const goalWithId = { ...data, id: doc.id };
                fetchedGoals.push(goalWithId);
                if (data.name === "Emergency Fund") efGoal = goalWithId;
            });

            setGoals(fetchedGoals);
            setEmergencyFundGoal(efGoal);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching goals:", error);
            toast.error("Cloud sync failed.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!emergencyFundGoal || monthlyExpenses <= 0) return;
        const recommendedTarget = monthlyExpenses * emergencyMonths;
        if (Math.abs(emergencyFundGoal.targetAmount - recommendedTarget) > 100) {
            handleUpdateGoal(emergencyFundGoal.id!, { targetAmount: recommendedTarget });
        }
    }, [monthlyExpenses, emergencyMonths, emergencyFundGoal]);

    const handleAddGoal = async () => {
        if (newGoal.name && newGoal.targetAmount && newGoal.deadline) {
            try {
                await addDoc(collection(db, `users/${USER_ID}/financialGoals`), {
                    name: newGoal.name,
                    targetAmount: parseFloat(newGoal.targetAmount),
                    currentAmount: parseFloat(newGoal.currentAmount) || 0,
                    deadline: newGoal.deadline,
                    category: newGoal.category || "General",
                    status: "on-track",
                });
                toast.success("Ambition set!");
                setNewGoal({ name: "", targetAmount: "", currentAmount: "", deadline: "", category: "" });
                setShowAddForm(false);
            } catch (error) {
                toast.error("Failed to set goal.");
            }
        }
    };

    const handleUpdateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
        try {
            const goalRef = doc(db, `users/${USER_ID}/financialGoals`, id);
            await updateDoc(goalRef, updates);
        } catch (error) {
            toast.error("Update failed.");
        }
    };

    const deleteGoal = async (id: string) => {
        if (confirm("Delete this financial goal?")) {
            try {
                await deleteDoc(doc(db, `users/${USER_ID}/financialGoals`, id));
                toast.success("Goal removed.");
            } catch (error) {
                toast.error("Deletion failed.");
            }
        }
    };

    const createEmergencyFund = async () => {
        const target = monthlyExpenses > 0 ? monthlyExpenses * 6 : 150000;
        await addDoc(collection(db, `users/${USER_ID}/financialGoals`), {
            name: "Emergency Fund",
            targetAmount: target,
            currentAmount: 0,
            deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            category: "Safety Net",
            status: "at-risk",
        });
    };

    if (loading) return <div className="space-y-4 px-6"><Progress value={33} className="h-1 animate-pulse" /></div>;

    return (
        <div className="glass p-6 rounded-2xl border border-white/10 shadow-xl relative">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-foreground">Ambitions & Goals</h2>
                        <p className="text-xs text-muted-foreground">Financial roadmap for the future</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        showAddForm ? "bg-muted text-foreground" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    )}
                >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showAddForm ? "Cancel" : "New Goal"}
                </motion.button>
            </div>

            {/* Emergency Fund Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden group shadow-2xl shadow-indigo-600/20"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-500">
                    <Shield className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-black text-white">Emergency Fund</h3>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] uppercase font-black">Safety Net</Badge>
                            </div>
                            <p className="text-xs text-indigo-100/70 font-medium">Auto-scaling based on your spending habits</p>
                        </div>

                        {!emergencyFundGoal ? (
                            <button onClick={createEmergencyFund} className="px-5 py-2.5 bg-white text-indigo-600 font-black text-xs rounded-xl shadow-lg">
                                Setup Safety Net
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/10">
                                <span className="text-[10px] font-black text-white/50 ml-2">TARGET</span>
                                <select
                                    value={emergencyMonths}
                                    onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                                    className="bg-transparent text-white font-bold text-xs outline-none"
                                >
                                    <option className="text-zinc-900" value={3}>3 Months</option>
                                    <option className="text-zinc-900" value={6}>6 Months</option>
                                    <option className="text-zinc-900" value={12}>12 Months</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {emergencyFundGoal ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] font-black text-indigo-200/50 uppercase tracking-widest mb-1">Currently Saved</div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl font-black text-white">₹{emergencyFundGoal.currentAmount.toLocaleString()}</div>
                                        <button
                                            onClick={() => {
                                                const newAmount = prompt("Update saved amount:", emergencyFundGoal.currentAmount.toString());
                                                if (newAmount && !isNaN(parseFloat(newAmount))) handleUpdateGoal(emergencyFundGoal.id!, { currentAmount: parseFloat(newAmount) });
                                            }}
                                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-indigo-200/50 uppercase tracking-widest mb-1">Goal Target</div>
                                    <div className="text-2xl font-bold text-white/90">₹{emergencyFundGoal.targetAmount.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Progress
                                    value={(emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100}
                                    className="h-2.5 bg-white/20"
                                    indicatorClassName="bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                />
                                <div className="flex justify-between items-center text-[10px] font-black text-white/70 uppercase tracking-tighter">
                                    <span>{Math.min(100, (emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100).toFixed(1)}% Completed</span>
                                    <span>₹{(emergencyFundGoal.targetAmount - emergencyFundGoal.currentAmount).toLocaleString()} Needed</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-indigo-100/50 italic text-sm border-2 border-dashed border-white/10 rounded-2xl">
                            Safety net not initialized.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Add Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mb-8 p-6 bg-muted/40 rounded-2xl border border-white/5 space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Ambition Name</label>
                                <input
                                    placeholder="e.g., New Laptop, Bali Trip"
                                    className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-indigo-500/50 transition-all"
                                    value={newGoal.name}
                                    onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Target Amount (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 85000"
                                    className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-indigo-500/50 transition-all"
                                    value={newGoal.targetAmount}
                                    onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Target Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-indigo-500/50 transition-all"
                                    value={newGoal.deadline}
                                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Category</label>
                                <input
                                    placeholder="e.g., Tech, Wellness"
                                    className="w-full px-4 py-3 bg-background border border-white/5 rounded-xl outline-none text-sm focus:border-indigo-500/50 transition-all"
                                    value={newGoal.category}
                                    onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddGoal}
                            className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 transition-all"
                        >
                            Confirm Roadmap
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Other Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.filter(g => g.name !== "Emergency Fund").map((goal, index) => {
                    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                    const isCompleted = percentage >= 100;

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 rounded-2xl border border-white/5 bg-muted/20 group hover:border-indigo-500/30 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-foreground">{goal.name}</h4>
                                        <Badge className="bg-indigo-500/10 text-indigo-500 border-0 text-[8px] uppercase">{goal.category}</Badge>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(goal.deadline).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const newAmount = prompt("Update saved amount:", goal.currentAmount.toString());
                                            if (newAmount && !isNaN(parseFloat(newAmount))) handleUpdateGoal(goal.id!, { currentAmount: parseFloat(newAmount) });
                                        }}
                                        className="p-2 bg-muted/50 rounded-lg text-muted-foreground hover:text-indigo-500 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteGoal(goal.id!)}
                                        className="p-2 bg-muted/50 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mt-auto">
                                <div className="flex justify-between text-xs font-black">
                                    <span className="text-foreground">₹{goal.currentAmount.toLocaleString()}</span>
                                    <span className="text-muted-foreground">Target ₹{goal.targetAmount.toLocaleString()}</span>
                                </div>
                                <Progress
                                    value={percentage}
                                    className="h-2 bg-muted/50"
                                    indicatorClassName={isCompleted ? "bg-emerald-500" : "bg-indigo-500"}
                                />
                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground">
                                    <span className={isCompleted ? "text-emerald-500" : ""}>{percentage.toFixed(0)}% COMPLETED</span>
                                    {isCompleted ? <div className="flex items-center gap-1 text-emerald-500"><TrendingUp className="w-3 h-3" /> GOAL REACHED</div> : <span>ROADMAP ACTIVE</span>}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {goals.length === 0 && !loading && (
                <div className="py-20 text-center bg-muted/5 rounded-2xl border border-dashed border-white/5 mt-4">
                    <TrendingUp className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No financial ambitions tracked yet.</p>
                </div>
            )}
        </div>
    );
}
