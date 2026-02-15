import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    query,
    where,
    deleteDoc,
    onSnapshot
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FinancialGoal } from "@/lib/types";

const COLLECTION_NAME = "financialGoals";

/**
 * Adds a new financial goal to Firestore
 */
export async function addGoal(userId: string, goal: FinancialGoal): Promise<string> {
    try {
        const goalsRef = collection(db, `users/${userId}/${COLLECTION_NAME}`);
        const docRef = await addDoc(goalsRef, goal);
        return docRef.id;
    } catch (error) {
        console.error("Error adding goal:", error);
        throw new Error("Failed to add goal");
    }
}

/**
 * Updates an existing goal
 */
export async function updateGoal(userId: string, goalId: string, updates: Partial<FinancialGoal>): Promise<void> {
    try {
        const goalRef = doc(db, `users/${userId}/${COLLECTION_NAME}`, goalId);
        await updateDoc(goalRef, updates);
    } catch (error) {
        console.error("Error updating goal:", error);
        throw new Error("Failed to update goal");
    }
}

/**
 * Deletes a goal
 */
export async function deleteGoal(userId: string, goalId: string): Promise<void> {
    try {
        const goalRef = doc(db, `users/${userId}/${COLLECTION_NAME}`, goalId);
        await deleteDoc(goalRef);
    } catch (error) {
        console.error("Error deleting goal:", error);
        throw new Error("Failed to delete goal");
    }
}

/**
 * Helper to fetch specific goals like "Emergency Fund"
 */
export async function fetchEmergencyFundGoal(userId: string): Promise<FinancialGoal | null> {
    try {
        const goalsRef = collection(db, `users/${userId}/${COLLECTION_NAME}`);
        const q = query(goalsRef, where("category", "==", "Emergency Fund"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FinancialGoal;
    } catch (error) {
        console.error("Error fetching emergency fund:", error);
        return null;
    }
}
