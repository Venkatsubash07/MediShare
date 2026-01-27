import { db } from "./firebase";
import {
  mockMedicines,
  mockInventory,
  mockSurplusPosts,
  mockRequests
} from "@/app/data/mockData";

import { doc, setDoc } from "firebase/firestore";

// 🔁 MAP OLD CLINIC IDS → REAL FIREBASE UIDS
const clinicIdMap: Record<string, string> = {
  "clinic-1": "rrfZd3qfH1gCPzQa427ttQCK3qC3", // Priya
  "clinic-2": "UH6DY8dtWDUQH9Fcj7WHkiaggPd2"  // Rajesh
};

export async function seedFirestore() {
  try {
    console.log("Seeding medicines...");
    for (const med of mockMedicines) {
      await setDoc(doc(db, "medicines", med.id), med);
    }

    console.log("Seeding inventory...");
    for (const item of mockInventory) {
      const realClinicId = clinicIdMap[item.clinicId] || item.clinicId;

      await setDoc(doc(db, "inventory", item.id), {
        ...item,
        clinicId: realClinicId
      });
    }

    console.log("Seeding surplus posts...");
    for (const post of mockSurplusPosts) {
      const realClinicId = clinicIdMap[post.clinicId] || post.clinicId;

      await setDoc(doc(db, "surplusPosts", post.id), {
        ...post,
        clinicId: realClinicId
      });
    }

    console.log("Seeding requests...");
    for (const req of mockRequests) {
      const realClinicId = clinicIdMap[req.clinicId] || req.clinicId;

      await setDoc(doc(db, "requests", req.id), {
        ...req,
        clinicId: realClinicId
      });
    }

    console.log("🔥 FIRESTORE SEEDED SUCCESSFULLY 🔥");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}
