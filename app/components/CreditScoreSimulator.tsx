"use client";

import { useState } from "react";
import { CreditScoreData } from "@/lib/types";

// Credit score calculation engine
function calculateCreditScore(data: CreditScoreData["factors"]): number {
    // CIBIL score calculation (simplified model)
    const paymentWeight = 0.35;
    const utilizationWeight = 0.30;
    const ageWeight = 0.15;
    const mixWeight = 0.10;
    const inquiryWeight = 0.10;

    // Payment history (35%)
    const paymentScore = (data.paymentHistory / 100) * 350;

    // Credit utilization (30%) - lower is better
    const utilization = data.creditUtilization;
    const utilizationScore = utilization <= 30 ? 300 : Math.max(0, 300 - ((utilization - 30) * 4));

    // Credit age (15%) - longer is better
    const ageScore = Math.min(150, (data.creditAge / 120) * 150); // 10 years = max

    // Credit mix (10%)
    const mixScore = (data.creditMix / 100) * 100;

    // Recent inquiries (10%) - fewer is better
    const inquiryScore = Math.max(0, 100 - (data.recentInquiries * 20));

    const totalScore = Math.round(
        300 + paymentScore + utilizationScore + ageScore + mixScore + inquiryScore
    );

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

    const getScoreColor = (score: number) => {
        if (score >= 750) return "#4CAF50";
        if (score >= 650) return "#FF9800";
        return "#f44336";
    };

    const getScoreRating = (score: number) => {
        if (score >= 750) return "Excellent";
        if (score >= 650) return "Good";
        if (score >= 550) return "Fair";
        return "Poor";
    };

    const getTips = () => {
        const tips = [];
        if (factors.paymentHistory < 95) tips.push("⚠️ Pay all EMIs/bills on time to improve payment history");
        if (factors.creditUtilization > 30) tips.push("⚠️ Keep credit utilization below 30% for better score");
        if (factors.creditAge < 24) tips.push("💡 Older credit accounts positively impact your score");
        if (factors.recentInquiries > 3) tips.push("⚠️ Reduce loan/credit card applications to avoid inquiries");
        if (factors.creditMix < 60) tips.push("💡 Maintain a healthy mix of secured and unsecured credit");
        if (tips.length === 0) tips.push("✅ Excellent! Keep maintaining these healthy credit habits");
        return tips;
    };

    return (
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#333" }}>Credit Score Simulator</h2>

            {/* Score Display */}
            <div
                style={{
                    background: `linear-gradient(135deg, ${getScoreColor(score)} 0%, ${getScoreColor(score)}dd 100%)`,
                    color: "white",
                    padding: "32px",
                    borderRadius: "12px",
                    textAlign: "center",
                    marginBottom: "24px",
                }}
            >
                <div style={{ fontSize: "16px", opacity: 0.9, marginBottom: "8px" }}>Your Estimated CIBIL Score</div>
                <div style={{ fontSize: "72px", fontWeight: "bold", marginBottom: "8px" }}>{score}</div>
                <div style={{ fontSize: "20px", fontWeight: "600" }}>{getScoreRating(score)}</div>
                <div style={{ fontSize: "14px", opacity: 0.9, marginTop: "8px" }}>Range: 300 - 900</div>
            </div>

            {/* Factor Sliders */}
            <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "#333" }}>Adjust Factors</h3>

                {/* Payment History */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "500" }}>Payment History (35% weight)</label>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#667eea" }}>{factors.paymentHistory}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={factors.paymentHistory}
                        onChange={(e) => setFactors({ ...factors, paymentHistory: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#667eea" }}
                    />
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        On-time payment rate (higher is better)
                    </div>
                </div>

                {/* Credit Utilization */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "500" }}>Credit Utilization (30% weight)</label>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#667eea" }}>{factors.creditUtilization}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={factors.creditUtilization}
                        onChange={(e) => setFactors({ ...factors, creditUtilization: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#667eea" }}
                    />
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        % of credit limit used (lower is better, aim for {"<"}30%)
                    </div>
                </div>

                {/* Credit Age */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "500" }}>Credit History Age (15% weight)</label>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#667eea" }}>{factors.creditAge} months</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="120"
                        value={factors.creditAge}
                        onChange={(e) => setFactors({ ...factors, creditAge: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#667eea" }}
                    />
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        Age of oldest credit account (longer is better)
                    </div>
                </div>

                {/* Credit Mix */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "500" }}>Credit Mix (10% weight)</label>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#667eea" }}>{factors.creditMix}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={factors.creditMix}
                        onChange={(e) => setFactors({ ...factors, creditMix: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#667eea" }}
                    />
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        Mix of credit cards, loans, etc. (diverse is better)
                    </div>
                </div>

                {/* Recent Inquiries */}
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <label style={{ fontSize: "14px", fontWeight: "500" }}>Recent Inquiries (10% weight)</label>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#667eea" }}>{factors.recentInquiries}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={factors.recentInquiries}
                        onChange={(e) => setFactors({ ...factors, recentInquiries: parseInt(e.target.value) })}
                        style={{ width: "100%", accentColor: "#667eea" }}
                    />
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        Hard inquiries in last 6 months (fewer is better)
                    </div>
                </div>
            </div>

            {/* Improvement Tips */}
            <div style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#333" }}>💡 Improvement Tips</h3>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {getTips().map((tip, index) => (
                        <li key={index} style={{ marginBottom: "8px", fontSize: "14px", color: "#555" }}>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
