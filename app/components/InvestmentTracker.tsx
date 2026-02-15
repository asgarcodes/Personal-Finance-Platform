"use client";

import { useState } from "react";
import { Investment } from "@/lib/types";

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
        const icons = {
            stocks: "📈",
            "mutual-funds": "📊",
            "fixed-deposit": "🏦",
            gold: "🪙",
            crypto: "💎",
            ppf: "🔒",
            nps: "👴",
        };
        return icons[type] || "💼";
    };

    const getTypeLabel = (type: Investment["type"]) => {
        return type.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    return (
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", color: "#333" }}>Investment Portfolio</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: "8px 16px",
                        background: "#667eea",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                    }}
                >
                    {showAddForm ? "Cancel" : "+ Add Investment"}
                </button>
            </div>

            {/* Portfolio Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Total Invested</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#333" }}>₹{totalInvested.toLocaleString()}</div>
                </div>
                <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Current Value</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#2196F3" }}>₹{totalCurrent.toLocaleString()}</div>
                </div>
                <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Total Gain/Loss</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: totalGain >= 0 ? "#4CAF50" : "#f44336" }}>
                        {totalGain >= 0 ? "+" : ""}₹{totalGain.toLocaleString()}
                    </div>
                </div>
                <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Returns</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: parseFloat(totalReturns) >= 0 ? "#4CAF50" : "#f44336" }}>
                        {parseFloat(totalReturns) >= 0 ? "+" : ""}{totalReturns}%
                    </div>
                </div>
            </div>

            {/* Add Investment Form */}
            {showAddForm && (
                <div style={{ marginBottom: "20px", padding: "16px", background: "#f5f5f5", borderRadius: "8px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Investment Name
                            </label>
                            <input
                                type="text"
                                value={newInvestment.name}
                                onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                                placeholder="e.g., HDFC Mid Cap"
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Type
                            </label>
                            <select
                                value={newInvestment.type}
                                onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value as Investment["type"] })}
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            >
                                <option value="stocks">Stocks</option>
                                <option value="mutual-funds">Mutual Funds</option>
                                <option value="fixed-deposit">Fixed Deposit</option>
                                <option value="gold">Gold</option>
                                <option value="crypto">Crypto</option>
                                <option value="ppf">PPF</option>
                                <option value="nps">NPS</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Invested Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={newInvestment.investedAmount}
                                onChange={(e) => setNewInvestment({ ...newInvestment, investedAmount: e.target.value })}
                                placeholder="100000"
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Current Value (₹)
                            </label>
                            <input
                                type="number"
                                value={newInvestment.currentValue}
                                onChange={(e) => setNewInvestment({ ...newInvestment, currentValue: e.target.value })}
                                placeholder="120000"
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Purchase Date
                            </label>
                            <input
                                type="date"
                                value={newInvestment.purchaseDate}
                                onChange={(e) => setNewInvestment({ ...newInvestment, purchaseDate: e.target.value })}
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button
                                onClick={addInvestment}
                                style={{
                                    width: "100%",
                                    padding: "10px 20px",
                                    background: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                }}
                            >
                                Add Investment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Investments List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {investments.map((investment, index) => {
                    const gain = investment.currentValue - investment.investedAmount;
                    const isProfit = gain >= 0;

                    return (
                        <div
                            key={index}
                            style={{
                                padding: "16px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "20px" }}>{getTypeIcon(investment.type)}</span>
                                    <div>
                                        <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>{investment.name}</div>
                                        <div style={{ fontSize: "12px", color: "#666" }}>{getTypeLabel(investment.type)}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Invested</div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                                        ₹{investment.investedAmount.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Current</div>
                                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#2196F3" }}>
                                        ₹{investment.currentValue.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", minWidth: "100px" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>Gain/Loss</div>
                                    <div style={{ fontSize: "16px", fontWeight: "700", color: isProfit ? "#4CAF50" : "#f44336" }}>
                                        {isProfit ? "+" : ""}₹{gain.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: "12px", color: isProfit ? "#4CAF50" : "#f44336" }}>
                                        ({isProfit ? "+" : ""}{investment.returns}%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {investments.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    No investments tracked yet. Click "Add Investment" to start!
                </div>
            )}
        </div>
    );
}
