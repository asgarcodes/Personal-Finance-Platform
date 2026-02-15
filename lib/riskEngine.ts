/**
 * Risk Engine
 * Detects financial risks based on spending patterns, savings, and emergency preparedness.
 */

// ============================================================================
// TYPES
// ============================================================================

export type AlertSeverity = "Low" | "Medium" | "High";

export interface FinancialAlert {
    type: string;
    severity: AlertSeverity;
    message: string;
}

export interface RiskDetectionInputs {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    emergencyFund: number; // Total emergency fund amount
}

// ============================================================================
// RISK DETECTION THRESHOLDS
// ============================================================================

const BURN_RATE_THRESHOLD = 0.85; // 85% of income
const SAVINGS_RATIO_THRESHOLD = 0.20; // 20% of income
const EMERGENCY_MONTHS_THRESHOLD = 3; // 3 months of expenses

// ============================================================================
// RISK DETECTION LOGIC
// ============================================================================

/**
 * Analyzes financial data and returns an array of risk alerts
 */
export function detectFinancialRisks(inputs: RiskDetectionInputs): FinancialAlert[] {
    const { monthlyIncome, monthlyExpenses, monthlySavings, emergencyFund } = inputs;
    const alerts: FinancialAlert[] = [];

    // Validation
    if (monthlyIncome <= 0) {
        alerts.push({
            type: "Invalid Data",
            severity: "High",
            message: "Income must be greater than zero to perform risk analysis.",
        });
        return alerts;
    }

    // Rule 1: High Burn Rate (Expenses > 85% of Income)
    const expenseRatio = monthlyExpenses / monthlyIncome;
    if (expenseRatio > BURN_RATE_THRESHOLD) {
        alerts.push({
            type: "High Burn Rate",
            severity: "High",
            message: `Your expenses (${(expenseRatio * 100).toFixed(1)}% of income) exceed the safe limit of ${BURN_RATE_THRESHOLD * 100}%. Consider reducing discretionary spending.`,
        });
    }

    // Rule 2: Low Savings Ratio (< 20%)
    const savingsRatio = monthlySavings / monthlyIncome;
    if (savingsRatio < SAVINGS_RATIO_THRESHOLD) {
        const severity: AlertSeverity = savingsRatio < 0.10 ? "High" : "Medium";
        alerts.push({
            type: "Low Savings",
            severity,
            message: `Your savings rate (${(savingsRatio * 100).toFixed(1)}%) is below the recommended ${SAVINGS_RATIO_THRESHOLD * 100}%. Aim to save at least 20% of your income.`,
        });
    }

    // Rule 3: Insufficient Emergency Fund (< 3 months)
    const monthsCovered = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    if (monthsCovered < EMERGENCY_MONTHS_THRESHOLD) {
        const severity: AlertSeverity = monthsCovered < 1 ? "High" : "Medium";
        alerts.push({
            type: "Financial Vulnerability",
            severity,
            message: `Your emergency fund covers only ${monthsCovered.toFixed(1)} months of expenses. Build it up to at least ${EMERGENCY_MONTHS_THRESHOLD} months for financial security.`,
        });
    }

    // Additional Risk: Negative Cash Flow
    const netCashFlow = monthlyIncome - monthlyExpenses;
    if (netCashFlow < 0) {
        alerts.push({
            type: "Negative Cash Flow",
            severity: "High",
            message: `You are spending more than you earn by ₹${Math.abs(netCashFlow).toFixed(2)} per month. This is unsustainable and requires immediate action.`,
        });
    }

    // Additional Risk: Zero Savings with Low Emergency Fund
    if (monthlySavings <= 0 && monthsCovered < 1) {
        alerts.push({
            type: "Critical Financial State",
            severity: "High",
            message: "You have no monthly savings and less than 1 month of emergency funds. You are at high risk of financial distress.",
        });
    }

    return alerts;
}

/**
 * Gets the highest severity level from a list of alerts
 */
export function getOverallRiskLevel(alerts: FinancialAlert[]): AlertSeverity | "None" {
    if (alerts.length === 0) return "None";

    const hasHigh = alerts.some(a => a.severity === "High");
    const hasMedium = alerts.some(a => a.severity === "Medium");

    if (hasHigh) return "High";
    if (hasMedium) return "Medium";
    return "Low";
}

/**
 * Counts alerts by severity
 */
export function getAlertSummary(alerts: FinancialAlert[]): { high: number; medium: number; low: number } {
    return {
        high: alerts.filter(a => a.severity === "High").length,
        medium: alerts.filter(a => a.severity === "Medium").length,
        low: alerts.filter(a => a.severity === "Low").length,
    };
}
