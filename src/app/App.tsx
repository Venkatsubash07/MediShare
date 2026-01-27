import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import {
  Clinic,
  InventoryItem,
  SurplusPosting,
  MedicineRequest,
  Transfer,
  Medicine
} from "@/app/types";

import { AuthPage } from "@/app/components/AuthPage";
import { Dashboard } from "@/app/components/Dashboard";
import { InventoryManagement } from "@/app/components/InventoryManagement";
import { SurplusManagement } from "@/app/components/SurplusManagement";
import { RequestManagement } from "@/app/components/RequestManagement";
import { MatchingView } from "@/app/components/MatchingView";
import { TransferManagement } from "@/app/components/TransferManagement";

import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Toaster } from "@/app/components/ui/sonner";

import {
  LayoutDashboard,
  Package,
  TrendingUp,
  AlertTriangle,
  Shuffle,
  ArrowLeftRight,
  LogOut,
  Building2
} from "lucide-react";

export default function App() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [surplusPosts, setSurplusPosts] = useState<SurplusPosting[]>([]);
  const [requests, setRequests] = useState<MedicineRequest[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  // 🔥 LOAD & SYNC DATA WHEN CLINIC LOGS IN
  useEffect(() => {
    if (!selectedClinic) return;

    let unsubTransfers: any;

    const loadData = async () => {
      // Clinics
      const clinicsSnap = await getDocs(collection(db, "clinics"));
      setClinics(clinicsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Clinic)));

      // Medicines
      const medSnap = await getDocs(collection(db, "medicines"));
      setMedicines(medSnap.docs.map(d => ({ id: d.id, ...d.data() } as Medicine)));

      // Inventory (only this clinic)
      const invSnap = await getDocs(
        query(collection(db, "inventory"), where("clinicId", "==", selectedClinic.id))
      );
      setInventory(invSnap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));

      // Surplus
      const surplusSnap = await getDocs(collection(db, "surplusPosts"));
      setSurplusPosts(surplusSnap.docs.map(d => ({ id: d.id, ...d.data() } as SurplusPosting)));

      // Requests
      const reqSnap = await getDocs(collection(db, "requests"));
      setRequests(reqSnap.docs.map(d => ({ id: d.id, ...d.data() } as MedicineRequest)));

      // 🔥 Transfers REAL-TIME SYNC
      unsubTransfers = onSnapshot(collection(db, "transfers"), (snapshot) => {
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as Transfer[];

        setTransfers(data);
      });
    };

    loadData();

    return () => {
      if (unsubTransfers) unsubTransfers();
    };
  }, [selectedClinic]);

  // 🔐 AUTH
  const handleLogin = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSelectedClinic(null);
  };

  // 💊 MEDICINES
  const handleAddMedicine = (medicineData: Omit<Medicine, "id">): Medicine => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: `med-${Date.now()}`
    };
    setMedicines([...medicines, newMedicine]);
    return newMedicine;
  };

  // 📦 INVENTORY
  const handleAddInventory = (item: Omit<InventoryItem, "id" | "addedDate">) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      addedDate: new Date()
    };
    setInventory([...inventory, newItem]);
  };

  // 📈 SURPLUS
  const handlePostSurplus = (posting: Omit<SurplusPosting, "id" | "postedDate">) => {
    const newPosting: SurplusPosting = {
      ...posting,
      id: `surplus-${Date.now()}`,
      postedDate: new Date()
    };
    setSurplusPosts([...surplusPosts, newPosting]);
  };

  const handleCancelSurplus = (surplusId: string) => {
    setSurplusPosts(surplusPosts.map(s =>
      s.id === surplusId ? { ...s, status: "Cancelled" } : s
    ));
  };

  // 🚨 REQUESTS
  const handleCreateRequest = (request: Omit<MedicineRequest, "id" | "requestedDate">) => {
    const newRequest: MedicineRequest = {
      ...request,
      id: `req-${Date.now()}`,
      requestedDate: new Date()
    };
    setRequests([...requests, newRequest]);
  };

  const handleCancelRequest = (requestId: string) => {
    setRequests(requests.map(r =>
      r.id === requestId ? { ...r, status: "Cancelled" } : r
    ));
  };

  // 🔁 TRANSFERS (REAL BACKEND VERSION)

  const handleRequestTransfer = async (surplusId: string, requestId: string) => {
    const surplus = surplusPosts.find(s => s.id === surplusId);
    const request = requests.find(r => r.id === requestId);

    if (!surplus || !request) return;

    await addDoc(collection(db, "transfers"), {
      surplusPostingId: surplusId,
      requestId,
      fromClinicId: surplus.clinicId,
      toClinicId: request.clinicId,
      inventoryItemId: surplus.inventoryItemId,
      quantity: Math.min(surplus.quantity, request.quantity),
      status: "Pending",
      requestedDate: serverTimestamp(),
      notes: "Transfer requested via matching system"
    });
  };

  const handleApproveTransfer = async (transferId: string) => {
    const ref = doc(db, "transfers", transferId);
    await updateDoc(ref, {
      status: "Approved",
      approvedDate: serverTimestamp()
    });
  };

  const handleSendTransfer = (transferId: string) => {
  setTransfers(transfers.map(t =>
    t.id === transferId
      ? { ...t, status: "In Transit" as const }
      : t
  ));
};

  const handleRejectTransfer = async (transferId: string) => {
    const ref = doc(db, "transfers", transferId);
    await updateDoc(ref, {
      status: "Rejected"
    });
  };

  const handleCompleteTransfer = async (transferId: string) => {
    const ref = doc(db, "transfers", transferId);
    await updateDoc(ref, {
      status: "Completed",
      completedDate: serverTimestamp()
    });
  };

  // 🔐 LOGIN PAGE
  if (!selectedClinic) {
    return <AuthPage clinics={clinics} onLogin={handleLogin} onRegister={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">MediShare Network</h1>
              <p className="text-sm text-muted-foreground">
                Inter-Clinic Medicine Inventory Sharing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold">{selectedClinic.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedClinic.location}, {selectedClinic.state}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard"><LayoutDashboard className="h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="h-4 w-4" />Inventory</TabsTrigger>
            <TabsTrigger value="surplus"><TrendingUp className="h-4 w-4" />Surplus</TabsTrigger>
            <TabsTrigger value="requests"><AlertTriangle className="h-4 w-4" />Requests</TabsTrigger>
            <TabsTrigger value="matching"><Shuffle className="h-4 w-4" />Matching</TabsTrigger>
            <TabsTrigger value="transfers"><ArrowLeftRight className="h-4 w-4" />Transfers</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard
              clinic={selectedClinic}
              inventory={inventory}
              surplusPosts={surplusPosts}
              requests={requests}
              transfers={transfers}
              medicines={medicines}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryManagement
              clinic={selectedClinic}
              inventory={inventory}
              medicines={medicines}
              onAddInventory={handleAddInventory}
              onAddMedicine={handleAddMedicine}
            />
          </TabsContent>

          <TabsContent value="surplus">
            <SurplusManagement
              clinic={selectedClinic}
              inventory={inventory}
              surplusPosts={surplusPosts}
              medicines={medicines}
              onPostSurplus={handlePostSurplus}
              onCancelSurplus={handleCancelSurplus}
            />
          </TabsContent>

          <TabsContent value="requests">
            <RequestManagement
              clinic={selectedClinic}
              requests={requests}
              medicines={medicines}
              onCreateRequest={handleCreateRequest}
              onCancelRequest={handleCancelRequest}
            />
          </TabsContent>

          <TabsContent value="matching">
            <MatchingView
              clinic={selectedClinic}
              clinics={clinics}
              inventory={inventory}
              surplusPosts={surplusPosts}
              requests={requests}
              medicines={medicines}
              onRequestTransfer={handleRequestTransfer}
            />
          </TabsContent>

          <TabsContent value="transfers">
            <TransferManagement
              clinic={selectedClinic}
              clinics={clinics}
              transfers={transfers}
              inventory={inventory}
              medicines={medicines}
              onApproveTransfer={handleApproveTransfer}
              onRejectTransfer={handleRejectTransfer}
              onCompleteTransfer={handleCompleteTransfer}
              onSendTransfer={handleSendTransfer}
            />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
