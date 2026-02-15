"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import FinancialWizard from "./components/FinancialWizard"; // Use the new Wizard
import BudgetPlanner from "./components/BudgetPlanner";
import GoalsTracker from "./components/GoalsTracker";
import type { Transaction } from "@/lib/types";
import { db } from "@/firebase/config";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { deleteTransaction } from "@/firebase/transactions";
import { toast } from "sonner"; // Import toast for feedback
import { Skeleton } from "@/components/ui/skeleton"; // Import ShadCN Skeleton

// User ID for demo purposes - match with dashboard
const USER_ID = "demo-user";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "budget" | "goals">("overview");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load transactions from Firestore
  useEffect(() => {
    // Determine query
    const transactionRef = collection(db, `users/${USER_ID}/transactions`);
    const q = query(transactionRef, orderBy("date", "desc"));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTransactions.push({
          id: doc.id,
          amount: data.amount,
          type: data.type,
          category: data.category,
          description: data.description,
          // Handle potentially different date formats if needed, or ensuring it's string
          date: data.date instanceof Timestamp ? data.date.toDate().toISOString().split('T')[0] : data.date,
        });
      });
      setTransactions(fetchedTransactions);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTransaction = (transaction: Transaction) => {
    // This handler might be redundant now if FinancialWizard handles its own flow internally
    // effectively, but we can keep it if needed for specialized logic.
    // In the new flow, the Wizard manages the 'Income -> Expense -> Summary' steps.
    // The Summary updates automatically because `transactions` state updates via onSnapshot.
  };

  const handleDeleteTransaction = async (id: string) => {
    // Optimized confirmation with sonner toast action could be better, but native confirm is safer for delete
    // We will show success toast after deletion.
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(USER_ID, id);
        toast.success("Transaction deleted successfully.");
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        toast.error("Failed to delete transaction.");
      }
    }
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  // Calculate monthly expenses (simple average or current month for this context)
  // For the prompt's purpose of "Monthly Expenses changes -> Update Goal", 
  // we need a robust "Monthly Expense" value. 
  // If we assume the demo user has data for the current month, passing that is best.
  // Otherwise, total expenses might be too high if data spans years.
  // Let's stick to Current Month Expenses for consistency with the Wizard.
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === "expense" && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          {/* Replaced Text with Skeleton for nicer loading */}
          <div className="space-y-4 w-64">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-8 w-[100px] rounded-full mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">💰 Personal Finance Platform</h1>
          <p className="text-base opacity-90">Complete financial management & tax planning solution</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Income</div>
            <div className="text-2xl font-bold text-green-500">₹{totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Expenses</div>
            <div className="text-2xl font-bold text-red-500">₹{totalExpenses.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Net Savings</div>
            <div className={`text-2xl font-bold ${netSavings >= 0 ? "text-blue-500" : "text-red-500"}`}>
              ₹{netSavings.toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Transactions</div>
            <div className="text-2xl font-bold text-indigo-500">{transactions.length}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "transactions", label: "✨ Add Flow" }, // Renamed to accurately reflect wizard nature
            { id: "budget", label: "📝 Budget Planner" },
            { id: "goals", label: "🎯 Financial Goals" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${activeTab === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-400 to-yellow-400 text-gray-900 border-none hover:shadow-lg hover:scale-105 transition-all duration-200 inline-block no-underline"
          >
            📈 Full Dashboard
          </Link>
        </div>

        {/* Content Area */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Features */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">🚀 What's New</h3>
                <ul className="space-y-3">
                  {[
                    "Transaction tracking with auto-categorization",
                    "Budget planner with visual progress",
                    "Goal-based savings tracker",
                    "Financial health scoring",
                    "India tax calculation (Old vs New regime)",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                      <span className="mr-2">✅</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">📌 Quick Actions</h3>
                <div className="grid gap-3">
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors text-left pl-4"
                  >
                    ➕ Add Data
                  </button>
                  <button
                    onClick={() => setActiveTab("budget")}
                    className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-left pl-4"
                  >
                    📊 Set Budget
                  </button>
                  <button
                    onClick={() => setActiveTab("goals")}
                    className="w-full p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors text-left pl-4"
                  >
                    🎯 Create Goal
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Transactions</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                  {/* Upgraded Empty State */}
                  <div className="text-4xl mb-4">💸</div>
                  <p className="mb-4">No transactions found.</p>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Add your first Transaction
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex justify-between items-center py-4 first:pt-0 last:pb-0 group">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{transaction.description}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.category} • {transaction.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-lg font-bold ${transaction.type === "income" ? "text-green-500" : "text-red-500"}`}>
                          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                        </div>
                        {transaction.id && (
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id!)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                            title="Delete transaction"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multi Study Flow via Helper */}
        {activeTab === "transactions" && <FinancialWizard transactions={transactions} />}

        {activeTab === "budget" && <BudgetPlanner transactions={transactions} />}
        {activeTab === "goals" && <GoalsTracker monthlyExpenses={currentMonthExpenses} />} // Correctly passing the monthlyExpenses prop
      </div>
    </div>
  );
}
