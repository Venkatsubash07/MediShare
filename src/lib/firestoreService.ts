import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Load inventory for current clinic
export async function getInventory(clinicId: string) {
  const q = query(
    collection(db, "inventory"),
    where("clinicId", "==", clinicId)
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Load surplus posts
export async function getSurplusPosts() {
  const snap = await getDocs(collection(db, "surplusPosts"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Load requests
export async function getRequests() {
  const snap = await getDocs(collection(db, "requests"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Load transfers
export async function getTransfers() {
  const snap = await getDocs(collection(db, "transfers"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
