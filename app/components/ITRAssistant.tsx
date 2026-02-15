"use client";

import { useState } from "react";
import { ITRData } from "@/lib/types";
import { compareTaxRegimes } from "@/lib/taxEngine";

export default function ITRAssistant() {
    const [itrData, setItrData] = useState<ITRData>({
        financialYear: "2023-24",
        status: "in-progress",
        grossIncome: 960000,
        deductions: {
            section80C: 150000,
            section80D: 25000,
            homeLoan: 0,
            other: 0,
        },
        taxPaid: {
            tds: 85000,
            advanceTax: 0,
            selfAssessment: 0,
        },
    });

    const totalDeductions =
        itrData.deductions.section80C +
        itrData.deductions.section80D +
        itrData.deductions.homeLoan +
        itrData.deductions.other;

    const totalTaxPaid = itrData.taxPaid.tds + itrData.taxPaid.advanceTax + itrData.taxPaid.selfAssessment;

    // Calculate tax using our engine
    const taxComparison = compareTaxRegimes({
        annualIncome: itrData.grossIncome,
        section80Deductions: totalDeductions,
        isSalaried: true,
    });

    const taxLiability = taxComparison.recommendedRegime === "Old"
        ? taxComparison.oldRegime.totalTax
        : taxComparison.newRegime.totalTax;

    const refundOrPayable = totalTaxPaid - taxLiability;

    const getStatusColor = (status: ITRData["status"]) => {
        const colors = {
            "not-started": "#9E9E9E",
            "in-progress": "#FF9800",
            "filed": "#2196F3",
            "verified": "#4CAF50",
        };
        return colors[status];
    };

    const getStatusLabel = (status: ITRData["status"]) => {
        return status.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    return (
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h2 style={{ fontSize: "20px", color: "#333", marginBottom: "4px" }}>ITR Filing Assistant</h2>
                    <div style={{ fontSize: "14px", color: "#666" }}>FY {itrData.financialYear}</div>
                </div>
                <div
                    style={{
                        padding: "8px 16px",
                        background: getStatusColor(itrData.status),
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600",
                    }}
                >
                    {getStatusLabel(itrData.status)}
                </div>
            </div>

            {/* Tax Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "20px",
                    borderRadius: "12px",
                    color: "white",
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Gross Income</div>
                    <div style={{ fontSize: "28px", fontWeight: "700" }}>₹{itrData.grossIncome.toLocaleString()}</div>
                </div>
                <div style={{
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    padding: "20px",
                    borderRadius: "12px",
                    color: "white",
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>Tax Liability</div>
                    <div style={{ fontSize: "28px", fontWeight: "700" }}>₹{Math.round(taxLiability).toLocaleString()}</div>
                    <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                        {taxComparison.recommendedRegime} Regime
                    </div>
                </div>
                <div style={{
                    background: refundOrPayable >= 0
                        ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    padding: "20px",
                    borderRadius: "12px",
                    color: "white",
                }}>
                    <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px" }}>
                        {refundOrPayable >= 0 ? "Refund Expected" : "Tax Payable"}
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "700" }}>₹{Math.abs(refundOrPayable).toLocaleString()}</div>
                </div>
            </div>

            {/* Income & Deductions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#333" }}>Income Details</h3>
                    <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                            Annual Gross Income (₹)
                        </label>
                        <input
                            type="number"
                            value={itrData.grossIncome}
                            onChange={(e) => setItrData({ ...itrData, grossIncome: parseFloat(e.target.value) || 0 })}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                            }}
                        />
                    </div>
                </div>

                <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#333" }}>Deductions</h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                        {Object.entries(itrData.deductions).map(([key, value]) => (
                            <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <label style={{ flex: 1, fontSize: "13px", textTransform: "capitalize" }}>
                                    {key.replace(/([A-Z])/g, " $1").trim()}:
                                </label>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) =>
                                        setItrData({
                                            ...itrData,
                                            deductions: { ...itrData.deductions, [key]: parseFloat(e.target.value) || 0 },
                                        })
                                    }
                                    style={{
                                        width: "120px",
                                        padding: "6px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "13px",
                                    }}
                                />
                            </div>
                        ))}
                        <div style={{
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: "1px solid #ddd",
                            display: "flex",
                            justifyContent: "space-between",
                            fontWeight: "600",
                        }}>
                            <span>Total:</span>
                            <span>₹{totalDeductions.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Paid */}
            <div style={{ padding: "16px", background: "#f8f9fa", borderRadius: "8px", marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#333" }}>Tax Already Paid</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                    {Object.entries(itrData.taxPaid).map(([key, value]) => (
                        <div key={key}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", textTransform: "capitalize" }}>
                                {key === "tds" ? "TDS" : key.replace(/([A-Z])/g, " $1").trim()}
                            </label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) =>
                                    setItrData({
                                        ...itrData,
                                        taxPaid: { ...itrData.taxPaid, [key]: parseFloat(e.target.value) || 0 },
                                    })
                                }
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    fontSize: "14px",
                                }}
                            />
                        </div>
                    ))}
                    <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "600" }}>
                            Total Paid
                        </label>
                        <div style={{
                            padding: "8px",
                            background: "#fff",
                            border: "2px solid #4CAF50",
                            borderRadius: "4px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#4CAF50",
                        }}>
                            ₹{totalTaxPaid.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Regime Comparison */}
            <div style={{ padding: "16px", background: "#e8f5e9", borderRadius: "8px", marginBottom: "16px", border: "1px solid #4CAF50" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#2e7d32" }}>💡 Tax Optimization</h3>
                <div style={{ fontSize: "14px", color: "#1b5e20", marginBottom: "8px" }}>
                    <strong>Recommended:</strong> {taxComparison.recommendedRegime} Regime saves you ₹{taxComparison.savings.toLocaleString()}
                </div>
                <div style={{ fontSize: "13px", color: "#2e7d32" }}>
                    Old Regime: ₹{Math.round(taxComparison.oldRegime.totalTax).toLocaleString()} |
                    New Regime: ₹{Math.round(taxComparison.newRegime.totalTax).toLocaleString()}
                </div>
            </div>

            {/* Action Steps */}
            <div style={{ padding: "16px", background: "#fff3e0", borderRadius: "8px", border: "1px solid #FF9800" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "#e65100" }}>📋 Next Steps</h3>
                <ol style={{ margin: 0, paddingLeft: "20px", color: "#e65100" }}>
                    <li style={{ marginBottom: "8px", fontSize: "14px" }}>Download Form 16 from employer</li>
                    <li style={{ marginBottom: "8px", fontSize: "14px" }}>Verify all TDS entries in Form 26AS</li>
                    <li style={{ marginBottom: "8px", fontSize: "14px" }}>File ITR before July 31st deadline</li>
                    <li style={{ fontSize: "14px" }}>Verify ITR within 30 days of filing</li>
                </ol>
            </div>
        </div>
    );
}
