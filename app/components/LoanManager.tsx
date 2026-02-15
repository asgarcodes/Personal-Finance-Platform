"use client";

import { useState } from "react";
import { Loan } from "@/lib/types";

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
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    // EMI Calculator
    const [calcData, setCalcData] = useState({
        principal: "",
        interestRate: "",
        tenureMonths: "",
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
    const totalPaid = totalPrincipal - totalRemaining;

    const getLoanIcon = (type: Loan["type"]) => {
        const icons = {
            personal: "💳",
            home: "🏠",
            car: "🚗",
            education: "🎓",
            "credit-card": "💰",
        };
        return icons[type] || "💼";
    };

    const calculateMonthsRemaining = (remaining: number, emi: number) => {
        if (emi <= 0) return 0;
        return Math.ceil(remaining / emi);
    };

    return (
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "20px", color: "#333" }}>Loan & EMI Manager</h2>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => setShowCalculator(!showCalculator)}
                        style={{
                            padding: "8px 16px",
                            background: "#FF9800",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                        }}
                    >
                        🧮 EMI Calculator
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
                <div style={{ background: "#fff3e0", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#e65100", marginBottom: "4px" }}>Total Borrowed</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#e65100" }}>₹{totalPrincipal.toLocaleString()}</div>
                </div>
                <div style={{ background: "#ffebee", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#c62828", marginBottom: "4px" }}>Remaining</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#c62828" }}>₹{totalRemaining.toLocaleString()}</div>
                </div>
                <div style={{ background: "#e8f5e9", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#2e7d32", marginBottom: "4px" }}>Paid Off</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#2e7d32" }}>₹{totalPaid.toLocaleString()}</div>
                </div>
                <div style={{ background: "#e3f2fd", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: "#1565c0", marginBottom: "4px" }}>Monthly EMI</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: "#1565c0" }}>₹{totalMonthlyEMI.toLocaleString()}</div>
                </div>
            </div>

            {/* EMI Calculator */}
            {showCalculator && (
                <div style={{ marginBottom: "20px", padding: "20px", background: "#f8f9fa", borderRadius: "8px", border: "2px solid #FF9800" }}>
                    <h3 style={{ fontSize: "18px", marginBottom: "16px", color: "#333" }}>EMI Calculator</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Loan Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={calcData.principal}
                                onChange={(e) => setCalcData({ ...calcData, principal: e.target.value })}
                                placeholder="500000"
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Interest Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={calcData.interestRate}
                                onChange={(e) => setCalcData({ ...calcData, interestRate: e.target.value })}
                                placeholder="8.5"
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                                Tenure (Months)
                            </label>
                            <input
                                type="number"
                                value={calcData.tenureMonths}
                                onChange={(e) => setCalcData({ ...calcData, tenureMonths: e.target.value })}
                                placeholder="60"
                                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "6px" }}
                            />
                        </div>
                    </div>
                    {calcData.principal && calcData.interestRate && calcData.tenureMonths && (
                        <div style={{ textAlign: "center", padding: "20px", background: "white", borderRadius: "8px" }}>
                            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>Your Monthly EMI</div>
                            <div style={{ fontSize: "36px", fontWeight: "700", color: "#FF9800" }}>
                                ₹{calculateEMI().toLocaleString()}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                                Total Payment: ₹{(calculateEMI() * parseFloat(calcData.tenureMonths)).toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loans List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {loans.map((loan, index) => {
                    const percentagePaid = ((loan.principal - loan.remainingAmount) / loan.principal) * 100;
                    const monthsLeft = calculateMonthsRemaining(loan.remainingAmount, loan.emiAmount);

                    return (
                        <div
                            key={index}
                            style={{
                                padding: "20px",
                                border: "2px solid #e0e0e0",
                                borderRadius: "12px",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ fontSize: "32px" }}>{getLoanIcon(loan.type)}</div>
                                    <div>
                                        <div style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>{loan.name}</div>
                                        <div style={{ fontSize: "14px", color: "#666", marginTop: "2px" }}>
                                            {loan.interestRate}% interest • Next EMI: {loan.nextEmiDate}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Monthly EMI</div>
                                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#f44336" }}>
                                        ₹{loan.emiAmount.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ fontSize: "14px", color: "#666" }}>Repayment Progress</span>
                                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                                        ₹{(loan.principal - loan.remainingAmount).toLocaleString()} / ₹{loan.principal.toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ background: "#f0f0f0", borderRadius: "8px", height: "12px", overflow: "hidden" }}>
                                    <div
                                        style={{
                                            width: `${percentagePaid}%`,
                                            background: "linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)",
                                            height: "100%",
                                            transition: "width 0.3s ease",
                                        }}
                                    />
                                </div>
                                <div style={{ fontSize: "12px", color: "#666", marginTop: "6px", textAlign: "right" }}>
                                    {percentagePaid.toFixed(1)}% paid off
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", paddingTop: "12px", borderTop: "1px solid #e0e0e0" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Remaining</div>
                                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#f44336" }}>
                                        ₹{loan.remainingAmount.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Months Left</div>
                                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>{monthsLeft}</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>Completion</div>
                                    <div style={{ fontSize: "16px", fontWeight: "600", color: "#2196F3" }}>
                                        {new Date(loan.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loans.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    No loans tracked. Great job being debt-free! 🎉
                </div>
            )}
        </div>
    );
}
