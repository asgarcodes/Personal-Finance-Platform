"use client";

import { useState, useEffect } from "react";
import { FinancialGoal } from "@/lib/types";
import { db } from "@/firebase/config";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

import { toast } from "sonner";

interface GoalsTrackerProps {
    monthlyExpenses?: number;
}

const USER_ID = "demo-user";

export default function GoalsTracker({ monthlyExpenses = 0 }: GoalsTrackerProps) {
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [loading, setLoading] = useState(true);

    // Emergency Fund State
    const [emergencyMonths, setEmergencyMonths] = useState(6);
    const [emergencyFundGoal, setEmergencyFundGoal] = useState<FinancialGoal | null>(null);

    // Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newGoal, setNewGoal] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
        category: "",
    });

    // Real-time listener for Goals
    useEffect(() => {
        const q = query(collection(db, `users/${USER_ID}/financialGoals`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedGoals: FinancialGoal[] = [];
            let efGoal: FinancialGoal | null = null;

            snapshot.forEach((doc) => {
                const data = doc.data() as FinancialGoal;
                const goalWithId = { ...data, id: doc.id };
                fetchedGoals.push(goalWithId);

                if (data.name === "Emergency Fund") {
                    efGoal = goalWithId;
                }
            });

            setGoals(fetchedGoals);
            setEmergencyFundGoal(efGoal);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching goals:", error);
            toast.error("Failed to load goals.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Auto-update Emergency Fund Goal when monthly expenses change
    useEffect(() => {
        if (!emergencyFundGoal || monthlyExpenses <= 0) return;

        const recommendedTarget = monthlyExpenses * emergencyMonths;

        // Only update if significantly different (to avoid loops or minor float jitter)
        if (Math.abs(emergencyFundGoal.targetAmount - recommendedTarget) > 100) {
            handleUpdateGoal(emergencyFundGoal.id!, {
                targetAmount: recommendedTarget,
                // Optional: add a note or flag that this was auto-updated
            });
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
                toast.success("Goal added successfully!");
                setNewGoal({ name: "", targetAmount: "", currentAmount: "", deadline: "", category: "" });
                setShowAddForm(false);
            } catch (error) {
                console.error("Error adding goal:", error);
                toast.error("Failed to add goal.");
            }
        }
    };

    const handleUpdateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
        try {
            const goalRef = doc(db, `users/${USER_ID}/financialGoals`, id);
            await updateDoc(goalRef, updates);
            toast.success("Goal updated!");
        } catch (error) {
            console.error("Error updating goal:", error);
            toast.error("Failed to update goal.");
        }
    };

    // Special handler for creating initial Emergency Fund if missing
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

    const getStatusColor = (status: FinancialGoal["status"]) => {
        switch (status) {
            case "completed": return "text-green-500 bg-green-500";
            case "at-risk": return "text-orange-500 bg-orange-500";
            default: return "text-blue-500 bg-blue-500";
        }
    };

    const getStatusIcon = (status: FinancialGoal["status"]) => {
        switch (status) {
            case "completed": return "✓";
            case "at-risk": return "⚠";
            default: return "→";
        }
    };

    if (loading) return <div className="text-gray-500 animate-pulse">Loading goals...</div>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Financial Goals</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors border border-transparent"
                >
                    {showAddForm ? "Cancel" : "+ Add Goal"}
                </button>
            </div>

            {/* Emergency Fund Section */}
            <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                            🛡️ Emergency Fund
                            {emergencyFundGoal && (
                                <span className={`text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border ${emergencyFundGoal.status === 'completed' ? 'text-green-600 border-green-200' : 'text-orange-600 border-orange-200'}`}>
                                    {emergencyFundGoal.status === 'completed' ? 'Fully Funded' : 'Building'}
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                            Recommended: {emergencyMonths} months of expenses
                        </p>
                    </div>

                    {!emergencyFundGoal ? (
                        <button onClick={createEmergencyFund} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                            Initialize Fund
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-indigo-800 dark:text-indigo-200">Target Months:</label>
                            <select
                                value={emergencyMonths}
                                onChange={(e) => setEmergencyMonths(Number(e.target.value))}
                                className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded px-2 py-1 text-sm"
                            >
                                <option value={3}>3 Months</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>12 Months</option>
                            </select>
                        </div>
                    )}
                </div>

                {emergencyFundGoal && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Savings</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                                        ₹{emergencyFundGoal.currentAmount.toLocaleString()}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newAmount = prompt("Update saved amount:", emergencyFundGoal.currentAmount.toString());
                                            if (newAmount && !isNaN(parseFloat(newAmount))) {
                                                handleUpdateGoal(emergencyFundGoal.id!, { currentAmount: parseFloat(newAmount) });
                                            }
                                        }}
                                        className="text-indigo-600 text-xs hover:underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Target Goal</div>
                                <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                                    ₹{emergencyFundGoal.targetAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300">
                                        Progress
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-300">
                                        {Math.min(100, (emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200 dark:bg-indigo-900">
                                <div
                                    style={{ width: `${Math.min(100, (emergencyFundGoal.currentAmount / emergencyFundGoal.targetAmount) * 100)}%` }}
                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                                ></div>
                            </div>
                        </div>

                        {emergencyFundGoal.currentAmount < emergencyFundGoal.targetAmount && (
                            <div className="text-sm text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border border-dashed border-gray-300 dark:border-gray-600">
                                You need <span className="font-bold text-indigo-600">₹{(emergencyFundGoal.targetAmount - emergencyFundGoal.currentAmount).toLocaleString()}</span> more to reach your safety net.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Other Goals List */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">Other Goals</h3>
                {goals.filter(g => g.name !== "Emergency Fund").map((goal, index) => {
                    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                    const borderColorClass = goal.status === 'completed' ? 'border-green-300' : 'border-blue-300';
                    const progressBgClass = goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500';

                    return (
                        <div key={index} className={`p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/30 ${borderColorClass}`}>
                            <div className="flex justify-between mb-2">
                                <div className="font-bold text-gray-700 dark:text-gray-200">{goal.name}</div>
                                <div className="text-sm text-gray-500">{goal.status}</div>
                            </div>
                            <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                <div className={`h-full ${progressBgClass}`} style={{ width: `${Math.min(100, percentage)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1 text-gray-500">
                                <span>₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}</span>
                                <span>{percentage.toFixed(0)}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {goals.length === 0 && !loading && (
                <div className="text-center text-gray-400 py-4">No other goals found.</div>
            )}

            {/* Add Goal Form (Simplified for brevity as focus is Emergency Fund) */}
            {showAddForm && (
                <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-bold mb-2 text-gray-700 dark:text-gray-300">New Goal</h4>
                    <div className="grid gap-2">
                        <input
                            placeholder="Goal Name"
                            className="p-2 border rounded"
                            value={newGoal.name}
                            onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Target Amount"
                            className="p-2 border rounded"
                            value={newGoal.targetAmount}
                            onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        />
                        <input
                            type="date"
                            className="p-2 border rounded"
                            value={newGoal.deadline}
                            onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                        <button onClick={handleAddGoal} className="bg-green-500 text-white p-2 rounded">
                            Save Goal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
