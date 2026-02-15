export type TransactionType = "income" | "expense";

export interface Transaction {
    id?: string;
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    date: string; // ISO 8601 date string
}

// Budget Types
export interface Budget {
    id?: string;
    category: string;
    limit: number;
    spent: number;
    period: "monthly" | "weekly" | "yearly";
}

// Financial Goal Types
export type GoalStatus = "on-track" | "at-risk" | "completed";

export interface FinancialGoal {
    id?: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // ISO date string
    category: string; // e.g., "Emergency Fund", "Vacation", "Car"
    status: GoalStatus;
    monthlyContribution?: number;
}

// Investment Types
export type InvestmentType = "stocks" | "mutual-funds" | "fixed-deposit" | "gold" | "crypto" | "ppf" | "nps";

export interface Investment {
    id?: string;
    name: string;
    type: InvestmentType;
    investedAmount: number;
    currentValue: number;
    purchaseDate: string;
    maturityDate?: string;
    returns: number; // Percentage
}

// Loan Types
export interface Loan {
    id?: string;
    name: string;
    type: "personal" | "home" | "car" | "education" | "credit-card";
    principal: number;
    remainingAmount: number;
    interestRate: number;
    emiAmount: number;
    startDate: string;
    endDate: string;
    nextEmiDate: string;
}

// Credit Score Types
export interface CreditScoreData {
    score: number; // 300-900
    factors: {
        paymentHistory: number; // 0-100
        creditUtilization: number; // 0-100
        creditAge: number; // months
        creditMix: number; // 0-100
        recentInquiries: number;
    };
    lastUpdated: string;
}

// ITR Types
export interface ITRData {
    financialYear: string;
    status: "not-started" | "in-progress" | "filed" | "verified";
    grossIncome: number;
    deductions: {
        section80C: number;
        section80D: number;
        homeLoan: number;
        other: number;
    };
    taxPaid: {
        tds: number;
        advanceTax: number;
        selfAssessment: number;
    };
    filingDate?: string;
    acknowledgmentNumber?: string;
}

// Tax Reminder
export interface TaxReminder {
    id?: string;
    title: string;
    description: string;
    dueDate: string;
    category: "ITR" | "Advance Tax" | "TDS" | "GST" | "Other";
    status: "pending" | "completed";
    priority: "high" | "medium" | "low";
}
