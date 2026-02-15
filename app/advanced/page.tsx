"use client";

import { useState } from "react";
import CreditScoreSimulator from "../components/CreditScoreSimulator";
import InvestmentTracker from "../components/InvestmentTracker";
import LoanManager from "../components/LoanManager";
import ITRAssistant from "../components/ITRAssistant";
import TaxReminders from "../components/TaxReminders";

export default function AdvancedFeatures() {
    const [activeTab, setActiveTab] = useState<"credit" | "investments" | "loans" | "itr" | "reminders">("credit");

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)" }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "24px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>🚀 Advanced Features</h1>
                    <p style={{ fontSize: "16px", opacity: 0.9 }}>Tax planning, credit score, investments & more</p>
                </div>
            </div>

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
                {/* Navigation Tabs */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                    {[
                        { id: "credit", label: "📊 Credit Score", icon: "📊" },
                        { id: "investments", label: "💼 Investments", icon: "💼" },
                        { id: "loans", label: "🏦 Loans & EMI", icon: "🏦" },
                        { id: "itr", label: "📄 ITR Assistant", icon: "📄" },
                        { id: "reminders", label: "⏰ Tax Reminders", icon: "⏰" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: "12px 24px",
                                background: activeTab === tab.id ? "#667eea" : "white",
                                color: activeTab === tab.id ? "white" : "#333",
                                border: activeTab === tab.id ? "none" : "1px solid #e0e0e0",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "15px",
                                fontWeight: activeTab === tab.id ? "600" : "normal",
                                transition: "all 0.2s",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div>
                    {activeTab === "credit" && <CreditScoreSimulator />}
                    {activeTab === "investments" && <InvestmentTracker />}
                    {activeTab === "loans" && <LoanManager />}
                    {activeTab === "itr" && <ITRAssistant />}
                    {activeTab === "reminders" && <TaxReminders />}
                </div>

                {/* Back to Home Button */}
                <div style={{ marginTop: "24px", textAlign: "center" }}>
                    <a
                        href="/"
                        style={{
                            display: "inline-block",
                            padding: "12px 32px",
                            background: "white",
                            color: "#667eea",
                            border: "2px solid #667eea",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "15px",
                        }}
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
