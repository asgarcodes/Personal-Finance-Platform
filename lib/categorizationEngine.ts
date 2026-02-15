/**
 * Categorization Engine
 * Analyzes transaction descriptions to assign categories automatically.
 */

interface KeywordMap {
    [category: string]: string[];
}

// Default rules
const DEFAULT_RULES: KeywordMap = {
    Food: ['grocery', 'restaurant', 'cafe', 'coffee', 'mcdonalds', 'starbucks', 'burger', 'pizza', 'diner'],
    Transport: ['uber', 'lyft', 'taxi', 'gas', 'shell', 'bp', 'train', 'bus', 'metro', 'subway', 'fuel'],
    Utilities: ['electric', 'water', 'gas', 'internet', 'comcast', 'verizon', 'at&t', 't-mobile', 'utility'],
    Entertainment: ['netflix', 'spotify', 'hulu', 'movie', 'cinema', 'concert', 'ticket', 'disney'],
    Shopping: ['amazon', 'walmart', 'target', 'clothing', 'shoe', 'mall', 'store', 'market'],
    Health: ['doctor', 'pharmacy', 'hospital', 'clinic', 'medical', 'drug', 'cvs', 'walgreens'],
};

// State to hold current rules (allows runtime extension)
let categoryRules: KeywordMap = { ...DEFAULT_RULES };

/**
 * Dynamically adds or updates a category rule.
 * @param category The category name (e.g., 'Groceries')
 * @param keywords Array of keywords to trigger this category
 */
export const addCategoryRule = (category: string, keywords: string[]): void => {
    if (categoryRules[category]) {
        categoryRules[category] = [...new Set([...categoryRules[category], ...keywords])];
    } else {
        categoryRules[category] = keywords;
    }
};

/**
 * Automatically categorizes a transaction based on its description.
 * @param description Transaction description string
 * @returns The matched category or 'Uncategorized'
 */
export const autoCategorize = (description: string): string => {
    const normalizedDesc = description.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryRules)) {
        if (keywords.some(keyword => normalizedDesc.includes(keyword.toLowerCase()))) {
            return category;
        }
    }

    return 'Uncategorized';
};

/**
 * Reset rules to defaults (useful for testing)
 */
export const resetRules = (): void => {
    categoryRules = { ...DEFAULT_RULES };
};
