import { useState } from 'react';
import { Clinic, InventoryItem, SurplusPosting, MedicineRequest, Transfer, Medicine } from '@/app/types';
import { mockClinics, mockMedicines, mockInventory, mockSurplusPosts, mockRequests, mockTransfers } from '@/app/data/mockData';
import { AuthPage } from '@/app/components/AuthPage';
import { Dashboard } from '@/app/components/Dashboard';
import { InventoryManagement } from '@/app/components/InventoryManagement';
import { SurplusManagement } from '@/app/components/SurplusManagement';
import { RequestManagement } from '@/app/components/RequestManagement';
import { MatchingView } from '@/app/components/MatchingView';
import { TransferManagement } from '@/app/components/TransferManagement';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Toaster } from '@/app/components/ui/sonner';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Shuffle, 
  ArrowLeftRight,
  LogOut,
  Building2
} from 'lucide-react';

export default function App() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>(mockClinics);
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [surplusPosts, setSurplusPosts] = useState<SurplusPosting[]>(mockSurplusPosts);
  const [requests, setRequests] = useState<MedicineRequest[]>(mockRequests);
  const [transfers, setTransfers] = useState<Transfer[]>(mockTransfers);

  // Auth Handlers
  const handleLogin = (clinic: Clinic) => {
    setSelectedClinic(clinic);
  };

  const handleRegister = (clinicData: Omit<Clinic, 'id'>) => {
    const newClinic: Clinic = {
      ...clinicData,
      id: `clinic-${Date.now()}`
    };
    setClinics([...clinics, newClinic]);
    // Auto-login after registration
    setSelectedClinic(newClinic);
  };

  // Medicine Handler
  const handleAddMedicine = (medicineData: Omit<Medicine, 'id'>): Medicine => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: `med-${Date.now()}`
    };
    setMedicines([...medicines, newMedicine]);
    return newMedicine;
  };

  // Inventory Handlers
  const handleAddInventory = (item: Omit<InventoryItem, 'id' | 'addedDate'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      addedDate: new Date()
    };
    setInventory([...inventory, newItem]);
  };

  // Surplus Handlers
  const handlePostSurplus = (posting: Omit<SurplusPosting, 'id' | 'postedDate'>) => {
    const newPosting: SurplusPosting = {
      ...posting,
      id: `surplus-${Date.now()}`,
      postedDate: new Date()
    };
    setSurplusPosts([...surplusPosts, newPosting]);
  };

  const handleCancelSurplus = (surplusId: string) => {
    setSurplusPosts(surplusPosts.map(s => 
      s.id === surplusId ? { ...s, status: 'Cancelled' as const } : s
    ));
  };

  // Request Handlers
  const handleCreateRequest = (request: Omit<MedicineRequest, 'id' | 'requestedDate'>) => {
    const newRequest: MedicineRequest = {
      ...request,
      id: `req-${Date.now()}`,
      requestedDate: new Date()
    };
    setRequests([...requests, newRequest]);
  };

  const handleCancelRequest = (requestId: string) => {
    setRequests(requests.map(r => 
      r.id === requestId ? { ...r, status: 'Cancelled' as const } : r
    ));
  };

  // Transfer Handlers
  const handleRequestTransfer = (surplusId: string, requestId: string) => {
    const surplus = surplusPosts.find(s => s.id === surplusId);
    const request = requests.find(r => r.id === requestId);
    
    if (!surplus || !request) return;

    const newTransfer: Transfer = {
      id: `trans-${Date.now()}`,
      surplusPostingId: surplusId,
      requestId: requestId,
      fromClinicId: surplus.clinicId,
      toClinicId: request.clinicId,
      inventoryItemId: surplus.inventoryItemId,
      quantity: Math.min(surplus.quantity, request.quantity),
      status: 'Pending',
      requestedDate: new Date(),
      notes: `Transfer requested via matching system`
    };

    setTransfers([...transfers, newTransfer]);
    setSurplusPosts(surplusPosts.map(s => 
      s.id === surplusId ? { ...s, status: 'Reserved' as const } : s
    ));
    setRequests(requests.map(r => 
      r.id === requestId ? { ...r, status: 'Matched' as const } : r
    ));
  };

  const handleApproveTransfer = (transferId: string) => {
    setTransfers(transfers.map(t => 
      t.id === transferId 
        ? { ...t, status: 'Approved' as const, approvedDate: new Date() } 
        : t
    ));
  };

  const handleRejectTransfer = (transferId: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    setTransfers(transfers.map(t => 
      t.id === transferId ? { ...t, status: 'Rejected' as const } : t
    ));
    
    // Restore surplus and request status
    if (transfer.surplusPostingId) {
      setSurplusPosts(surplusPosts.map(s => 
        s.id === transfer.surplusPostingId ? { ...s, status: 'Available' as const } : s
      ));
    }
    if (transfer.requestId) {
      setRequests(requests.map(r => 
        r.id === transfer.requestId ? { ...r, status: 'Open' as const } : r
      ));
    }
  };

  const handleCompleteTransfer = (transferId: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    setTransfers(transfers.map(t => 
      t.id === transferId 
        ? { ...t, status: 'Completed' as const, completedDate: new Date() } 
        : t
    ));

    // Update surplus posting
    if (transfer.surplusPostingId) {
      setSurplusPosts(surplusPosts.map(s => 
        s.id === transfer.surplusPostingId ? { ...s, status: 'Transferred' as const } : s
      ));
    }

    // Update request
    if (transfer.requestId) {
      setRequests(requests.map(r => 
        r.id === transfer.requestId ? { ...r, status: 'Fulfilled' as const } : r
      ));
    }

    // Update inventory
    setInventory(inventory.map(i => 
      i.id === transfer.inventoryItemId 
        ? { ...i, quantity: i.quantity - transfer.quantity } 
        : i
    ));
  };

  const handleLogout = () => {
    setSelectedClinic(null);
  };

  if (!selectedClinic) {
    return <AuthPage clinics={clinics} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="surplus" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Surplus</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center gap-2">
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Matching</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Transfers</span>
            </TabsTrigger>
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
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>MediShare Network - Reducing medicine waste, saving lives</p>
            <p className="mt-1">
              Connecting {clinics.length} clinics across India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
