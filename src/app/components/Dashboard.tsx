import { Clinic, InventoryItem, SurplusPosting, MedicineRequest, Transfer, Medicine } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Package, AlertTriangle, Users, TrendingUp, Activity, IndianRupee } from 'lucide-react';
import { calculateImpactStats } from '@/app/data/mockData';

interface DashboardProps {
  clinic: Clinic;
  inventory: InventoryItem[];
  surplusPosts: SurplusPosting[];
  requests: MedicineRequest[];
  transfers: Transfer[];
  medicines: Medicine[];
}

export function Dashboard({ clinic, inventory, surplusPosts, requests, transfers, medicines }: DashboardProps) {
  const clinicInventory = inventory.filter(item => item.clinicId === clinic.id);
  const clinicSurplus = surplusPosts.filter(post => post.clinicId === clinic.id);
  const clinicRequests = requests.filter(req => req.clinicId === clinic.id);
  const clinicTransfers = transfers.filter(
    t => t.fromClinicId === clinic.id || t.toClinicId === clinic.id
  );

  const expiringItems = clinicInventory.filter(item => item.status === 'Expiring Soon');
  const lowStockItems = clinicInventory.filter(item => item.status === 'Low Stock');

  const impactStats = calculateImpactStats(transfers);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicInventory.length}</div>
            <p className="text-xs text-muted-foreground">
              {expiringItems.length} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Surplus Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clinicSurplus.filter(s => s.status === 'Available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for sharing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clinicRequests.filter(r => r.status === 'Open').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {clinicRequests.filter(r => r.urgency === 'Critical').length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicTransfers.length}</div>
            <p className="text-xs text-muted-foreground">
              {clinicTransfers.filter(t => t.status === 'Completed').length} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {expiringItems.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Medicines Expiring Soon
              </CardTitle>
              <CardDescription>These items need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {expiringItems.slice(0, 3).map((item) => {
  const medicine = medicines.find(m => m.id === item.medicineId);

  const expiry =
    item.expiryDate instanceof Date
      ? item.expiryDate
      : typeof item.expiryDate === 'object' && 'toDate' in item.expiryDate
      ? (item.expiryDate as any).toDate()
      : new Date(item.expiryDate);

  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <li key={item.id} className="text-sm">
      <span className="font-medium">{medicine?.name}</span> - {item.quantity} {item.unit}
      <span className="text-orange-600 ml-2">
        (Expires in {daysUntilExpiry} days)
      </span>
    </li>
  );
})}

              </ul>
            </CardContent>
          </Card>
        )}

        {lowStockItems.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Low Stock Items
              </CardTitle>
              <CardDescription>Consider requesting these medicines</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lowStockItems.map((item) => {
                  const medicine = medicines.find(m => m.id === item.medicineId);
                  return (
                    <li key={item.id} className="text-sm">
                      <span className="font-medium">{medicine?.name}</span> - {item.quantity} {item.unit}
                      <span className="text-yellow-600 ml-2">(Low)</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Impact Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Impact Statistics</CardTitle>
          <CardDescription>
            Collective impact across all clinics in the network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Medicines Saved</p>
              <p className="text-2xl font-bold text-green-600">
                {impactStats.medicinesSaved.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Waste Reduced</p>
              <p className="text-2xl font-bold text-green-600">
                {impactStats.wasteReduced}g
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transfers</p>
              <p className="text-2xl font-bold text-blue-600">
                {impactStats.transfersCompleted}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Clinics Helped</p>
              <p className="text-2xl font-bold text-purple-600 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {impactStats.clinicsHelped}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Est. Patients</p>
              <p className="text-2xl font-bold text-indigo-600">
                {impactStats.estimatedPatients}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Est. Value</p>
              <p className="text-2xl font-bold text-orange-600 flex items-center">
                <IndianRupee className="h-5 w-5" />
                {impactStats.estimatedValue.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
