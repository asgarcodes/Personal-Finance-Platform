/**
 * Scoring Engine
 * Calculates financial health score based on weighted financial metrics.
 */

export interface ScoringInputs {
    monthlyIncome: number;
    totalExpenses: number;
    savings: number;  // Monthly savings
    emergencyFund: number; // Total emergency fund amount
    debt: number; // Total debt amount
}

export interface ScoringResult {
    score: number; // 0-100
    riskLevel: "Low" | "Moderate" | "High";
    improvementSuggestions: string[];
    breakdown: {
        savingsScore: number;
        emergencyScore: number;
        debtScore: number;
        burnRateScore: number;
    };
}

export const calculateFinancialScore = (inputs: ScoringInputs): ScoringResult => {
    const {
        monthlyIncome,
        totalExpenses,
        emergencyFund,
        debt
    } = inputs;

    // Use calculated savings based on income and expenses to ensure consistency
    // Although inputs.savings is provided, recalculating ensures data integrity if provided independently
    const calculatedSavings = monthlyIncome - totalExpenses;

    if (monthlyIncome <= 0) {
        return {
            score: 0,
            riskLevel: "High",
            improvementSuggestions: ["Income is required to calculate score."],
            breakdown: { savingsScore: 0, emergencyScore: 0, debtScore: 0, burnRateScore: 0 }
        };
    }

    const suggestions: string[] = [];

    // ==========================================
    // 1. Savings Ratio (30% weight)
    // Formula: (Income - Expenses) / Income
    // >40% = 100
    // 20-40% = Medium (mapped 50-99)
    // <20% = Low (mapped 0-49)
    // ==========================================
    const savingsRatio = calculatedSavings / monthlyIncome;
    let savingsScore = 0;

    if (savingsRatio >= 0.40) {
        savingsScore = 100;
    } else if (savingsRatio >= 0.20) {
        // 20% -> 50, 40% -> 99
        // Range: 0.2
        // Score Range: 49
        savingsScore = 50 + ((savingsRatio - 0.20) / 0.20) * 49;
    } else if (savingsRatio > 0) {
        // 0% -> 0, 20% -> 49
        savingsScore = (savingsRatio / 0.20) * 49;
    } else {
        savingsScore = 0;
        suggestions.push("Expenses exceed income. Reduce spending immediately.");
    }

    if (savingsRatio < 0.20 && savingsRatio > 0) {
        suggestions.push("Try to save at least 20% of your income.");
    }


    // ==========================================
    // 2. Burn Rate (20% weight)
    // Formula: Expenses / Income
    // <70% = Strong (100)
    // 70-85% = Moderate (50-99)
    // >85% = High Risk (0-49)
    // ==========================================
    const burnRate = totalExpenses / monthlyIncome;
    let burnRateScore = 0;

    if (burnRate <= 0.70) {
        burnRateScore = 100;
    } else if (burnRate <= 0.85) {
        // 70% -> 99, 85% -> 50
        // Range: 0.15
        // Score Range: 49 (decreasing)
        burnRateScore = 99 - ((burnRate - 0.70) / 0.15) * 49;
    } else {
        // 85% -> 49, 100% -> 0
        // Range: 0.15
        if (burnRate >= 1.0) {
            burnRateScore = 0;
        } else {
            burnRateScore = 49 - ((burnRate - 0.85) / 0.15) * 49;
        }
        suggestions.push("High burn rate! Expenses are consuming too much of your income.");
    }


    // ==========================================
    // 3. Emergency Fund Coverage (35% weight)
    // Formula: Current Savings / Monthly Expenses
    // >6 months = 100
    // 3-6 months = Moderate (50-99)
    // 1-3 months = Low (20-49)
    // <1 month = Major Penalty (0-19)
    // ==========================================
    // Handle specific case where expenses are 0 to avoid Infinity
    const effectiveExpenses = totalExpenses > 0 ? totalExpenses : 1;
    const emergencyMonths = emergencyFund / effectiveExpenses;
    let emergencyScore = 0;

    if (emergencyMonths >= 6) {
        emergencyScore = 100;
    } else if (emergencyMonths >= 3) {
        // 3 -> 50, 6 -> 99
        emergencyScore = 50 + ((emergencyMonths - 3) / 3) * 49;
    } else if (emergencyMonths >= 1) {
        // 1 -> 20, 3 -> 49
        emergencyScore = 20 + ((emergencyMonths - 1) / 2) * 29;
        suggestions.push("Build emergency fund to cover at least 3-6 months.");
    } else {
        // 0 -> 0, 1 -> 19
        emergencyScore = emergencyMonths * 19;
        suggestions.push("CRITICAL: Emergency fund is less than 1 month. Proritize savings.");
    }


    // ==========================================
    // 4. Debt Ratio (15% weight)
    // Formula: Debt / Annual Income
    // < 10% = 100
    // 10-40% = 70-99
    // 40-100% = 30-69
    // >100% = 0-29
    // ==========================================
    const annualIncome = monthlyIncome * 12;
    // Avoid division by zero if annualIncome is somehow 0
    const debtToIncomeRatio = annualIncome > 0 ? debt / annualIncome : (debt > 0 ? 100 : 0);
    let debtScore = 0;

    if (debtToIncomeRatio <= 0.10) {
        debtScore = 100;
    } else if (debtToIncomeRatio <= 0.40) {
        // 0.10 -> 99, 0.40 -> 70
        debtScore = 99 - ((debtToIncomeRatio - 0.10) / 0.30) * 29;
    } else if (debtToIncomeRatio <= 1.0) {
        // 0.40 -> 69, 1.0 -> 30
        debtScore = 69 - ((debtToIncomeRatio - 0.40) / 0.60) * 39;
    } else {
        // > 100% -> 0-29
        debtScore = Math.max(0, 29 - ((debtToIncomeRatio - 1.0) * 10)); // Arbitrary decay above 100%
        suggestions.push("Total debt is high relative to annual income. Focus on paying down debt.");
    }


    // ==========================================
    // WEIGHTED TOTAL & PENALTIES
    // ==========================================
    let totalScore = (
        (savingsScore * 0.30) +
        (burnRateScore * 0.20) +
        (emergencyScore * 0.35) +
        (debtScore * 0.15)
    );

    // Rule 3: If emergencyMonths < 3, final score cannot exceed 80.
    if (emergencyMonths < 3) {
        totalScore = Math.min(totalScore, 80);
    }

    // Normalizing Score (Rounding)
    let finalScore = Math.round(totalScore);

    // ==========================================
    // RISK CLASSIFICATION
    // 80-100 -> Low Risk
    // 50-79 -> Moderate Risk
    // 0-49 -> High Risk
    // ==========================================
    let riskLevel: ScoringResult['riskLevel'] = "Moderate";

    if (finalScore >= 80) {
        riskLevel = "Low";
    } else if (finalScore >= 50) {
        riskLevel = "Moderate";
    } else {
        riskLevel = "High";
    }

    // Rule 4: If emergencyMonths < 1, risk level must be at least Moderate.
    // This effectively means it CANNOT be Low. If it was Low (e.g. 85), force to Moderate.
    // If it was High, it stays High (which is fine, "at least Moderate" usually implies "worse or equal to Moderate" in risk terms context, 
    // but in "Level" terms usually High Risk > Moderate Risk > Low Risk).
    // Let's interpret "at least Moderate" as "Risk cannot be Low". 
    if (emergencyMonths < 1 && riskLevel === "Low") {
        riskLevel = "Moderate";
    }

    return {
        score: finalScore,
        riskLevel,
        improvementSuggestions: suggestions,
        breakdown: {
            savingsScore: Math.round(savingsScore),
            emergencyScore: Math.round(emergencyScore),
            debtScore: Math.round(debtScore),
            burnRateScore: Math.round(burnRateScore)
        }
    };
};
