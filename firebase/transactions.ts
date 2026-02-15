/**
 * Transaction Service
 * Handles all Firestore operations for user transactions
 */

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    Timestamp,
    DocumentData
} from "firebase/firestore";
import { db } from "./config";
import { Transaction } from "../lib/types";

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionDocument extends Omit<Transaction, 'date'> {
    date: Timestamp; // Firestore uses Timestamp
    createdAt: Timestamp;
}

export interface AddTransactionParams {
    userId: string;
    transaction: Transaction;
}

// ============================================================================
// FIRESTORE OPERATIONS
// ============================================================================

/**
 * Adds a new transaction to Firestore
 * @param params User ID and transaction data
 * @returns The ID of the newly created transaction document
 */
export async function addTransaction(params: AddTransactionParams): Promise<string> {
    const { userId, transaction } = params;

    try {
        // Reference to user's transactions collection
        const transactionsRef = collection(db, `users/${userId}/transactions`);

        // Convert date string to Firestore Timestamp
        const transactionDoc: TransactionDocument = {
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            description: transaction.description,
            date: Timestamp.fromDate(new Date(transaction.date)),
            createdAt: Timestamp.now(),
        };

        // Add document to Firestore
        const docRef = await addDoc(transactionsRef, transactionDoc);

        return docRef.id;
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw new Error("Failed to add transaction to Firestore");
    }
}

/**
 * Fetches all transactions for a user, ordered by date (newest first)
 * @param userId The user's ID
 * @returns Array of transactions with IDs
 */
export async function fetchTransactions(userId: string): Promise<(Transaction & { id: string })[]> {
    try {
        // Reference to user's transactions collection
        const transactionsRef = collection(db, `users/${userId}/transactions`);

        // Query transactions ordered by date (descending)
        const q = query(transactionsRef, orderBy("date", "desc"));

        const querySnapshot = await getDocs(q);

        const transactions: (Transaction & { id: string })[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as TransactionDocument;

            transactions.push({
                id: doc.id,
                amount: data.amount,
                type: data.type,
                category: data.category,
                description: data.description,
                date: data.date.toDate().toISOString().split('T')[0], // Convert to YYYY-MM-DD
            });
        });

        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw new Error("Failed to fetch transactions from Firestore");
    }
}

/**
 * Deletes a transaction from Firestore
 * @param userId The user's ID
 * @param transactionId The ID of the transaction to delete
 */
export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
    try {
        const transactionRef = doc(db, `users/${userId}/transactions`, transactionId);
        await deleteDoc(transactionRef);
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw new Error("Failed to delete transaction from Firestore");
    }
}

/**
 * Fetches transactions within a date range
 * @param userId The user's ID
 * @param startDate Start date (ISO string)
 * @param endDate End date (ISO string)
 * @returns Array of transactions within the range
 */
export async function fetchTransactionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
): Promise<(Transaction & { id: string })[]> {
    try {
        const allTransactions = await fetchTransactions(userId);

        return allTransactions.filter(t => {
            return t.date >= startDate && t.date <= endDate;
        });
    } catch (error) {
        console.error("Error fetching transactions by date range:", error);
        throw new Error("Failed to fetch transactions by date range");
    }
}

/**
 * Calculates total income and expenses from transactions
 * @param transactions Array of transactions
 */
export function calculateTotals(transactions: Transaction[]): { income: number; expenses: number } {
    return transactions.reduce(
        (acc, t) => {
            if (t.type === "income") {
                acc.income += t.amount;
            } else {
                acc.expenses += t.amount;
            }
            return acc;
        },
        { income: 0, expenses: 0 }
    );
}
