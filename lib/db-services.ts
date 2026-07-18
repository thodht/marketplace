import { db } from "@/lib/firebase-client"; // Your Firebase/DB config
import { doc, getDoc, setDoc } from "firebase/firestore";

export class DatabaseService<T> {
    constructor(private collectionName: string) { }

    async getById(id: string): Promise<T | null> {
        const docRef = doc(db, this.collectionName, id);
        const snap = await getDoc(docRef);
        return snap.exists() ? (snap.data() as T) : null;
    }

    async save(id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await setDoc(docRef, data, { merge: true });
    }
}