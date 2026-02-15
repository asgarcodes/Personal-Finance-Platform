/**
 * Tax Engine - India FY Simulation
 * Estimates tax liability under Old Regime and New Regime
 * Recommends the best regime based on tax savings
 */

// ============================================================================
// TAX SLAB CONSTANTS - INDIA (FY 2024-25)
// ============================================================================

/** Old Tax Regime Slabs (in ₹) */
const OLD_REGIME_SLABS = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 },
] as const;

/** New Tax Regime Slabs (in ₹) */
const NEW_REGIME_SLABS = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 600000, rate: 0.05 },
    { min: 600000, max: 900000, rate: 0.10 },
    { min: 900000, max: 1200000, rate: 0.15 },
    { min: 1200000, max: 1500000, rate: 0.20 },
    { min: 1500000, max: Infinity, rate: 0.30 },
] as const;

/** Standard Deduction (applicable to salaried individuals) */
const STANDARD_DEDUCTION = 50000;

/** Health & Education Cess (4% on total tax) */
const CESS_RATE = 0.04;

// ============================================================================
// TYPES
// ============================================================================

export interface TaxInputs {
    /** Annual Gross Income (in ₹) */
    annualIncome: number;

    /** Deductions under 80C, 80D, etc. (Old Regime only) */
    section80Deductions?: number;

    /** Is the taxpayer salaried? (affects standard deduction) */
    isSalaried?: boolean;
}

export interface RegimeTaxBreakdown {
    regime: "Old" | "New";
    grossIncome: number;
    deductions: number;
    taxableIncome: number;
    taxBeforeCess: number;
    cess: number;
    totalTax: number;
}

export interface TaxComparisonResult {
    oldRegime: RegimeTaxBreakdown;
    newRegime: RegimeTaxBreakdown;
    recommendedRegime: "Old" | "New";
    savings: number; // How much you save by choosing recommended regime
    savingsPercentage: number;
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates tax based on progressive slabs
 */
function calculateSlabTax(
    taxableIncome: number,
    slabs: readonly { min: number; max: number; rate: number }[]
): number {
    let tax = 0;

    for (const slab of slabs) {
        if (taxableIncome > slab.min) {
            const taxableInThisSlab = Math.min(taxableIncome, slab.max) - slab.min;
            tax += taxableInThisSlab * slab.rate;
        }
    }

    return tax;
}

/**
 * Calculate tax under Old Regime
 */
export function calculateOldRegimeTax(inputs: TaxInputs): RegimeTaxBreakdown {
    const { annualIncome, section80Deductions = 0, isSalaried = true } = inputs;

    // Old regime allows standard deduction + other deductions
    const totalDeductions = (isSalaried ? STANDARD_DEDUCTION : 0) + section80Deductions;
    const taxableIncome = Math.max(0, annualIncome - totalDeductions);

    const taxBeforeCess = calculateSlabTax(taxableIncome, OLD_REGIME_SLABS);
    const cess = taxBeforeCess * CESS_RATE;
    const totalTax = taxBeforeCess + cess;

    return {
        regime: "Old",
        grossIncome: annualIncome,
        deductions: totalDeductions,
        taxableIncome,
        taxBeforeCess,
        cess,
        totalTax,
    };
}

/**
 * Calculate tax under New Regime
 */
export function calculateNewRegimeTax(inputs: TaxInputs): RegimeTaxBreakdown {
    const { annualIncome, isSalaried = true } = inputs;

    // New regime: Standard deduction allowed, but NO other deductions
    const totalDeductions = isSalaried ? STANDARD_DEDUCTION : 0;
    const taxableIncome = Math.max(0, annualIncome - totalDeductions);

    const taxBeforeCess = calculateSlabTax(taxableIncome, NEW_REGIME_SLABS);
    const cess = taxBeforeCess * CESS_RATE;
    const totalTax = taxBeforeCess + cess;

    return {
        regime: "New",
        grossIncome: annualIncome,
        deductions: totalDeductions,
        taxableIncome,
        taxBeforeCess,
        cess,
        totalTax,
    };
}

/**
 * Compare Old vs New Regime and recommend the best option
 */
export function compareTaxRegimes(inputs: TaxInputs): TaxComparisonResult {
    const oldRegime = calculateOldRegimeTax(inputs);
    const newRegime = calculateNewRegimeTax(inputs);

    const recommendedRegime = oldRegime.totalTax <= newRegime.totalTax ? "Old" : "New";
    const savings = Math.abs(oldRegime.totalTax - newRegime.totalTax);
    const lowerTax = Math.min(oldRegime.totalTax, newRegime.totalTax);
    const savingsPercentage = lowerTax > 0 ? (savings / lowerTax) * 100 : 0;

    return {
        oldRegime,
        newRegime,
        recommendedRegime,
        savings: Math.round(savings),
        savingsPercentage: parseFloat(savingsPercentage.toFixed(2)),
    };
}
