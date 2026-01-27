import { useState } from 'react';
import { Clinic, InventoryItem, Medicine } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Plus, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryManagementProps {
  clinic: Clinic;
  inventory: InventoryItem[];
  medicines: Medicine[];
  onAddInventory: (item: Omit<InventoryItem, 'id' | 'addedDate'>) => void;
  onAddMedicine: (medicine: Omit<Medicine, 'id'>) => Medicine;
}

/* 🔧 Universal date converter (handles Date, Firestore Timestamp, string) */
const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value.seconds) return new Date(value.seconds * 1000); // Firestore Timestamp
  return new Date(value);
};

export function InventoryManagement({ clinic, inventory, medicines, onAddInventory, onAddMedicine }: InventoryManagementProps) {
  const [open, setOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualMedicineName, setManualMedicineName] = useState('');
  const [manualGenericName, setManualGenericName] = useState('');
  const [manualCategory, setManualCategory] = useState<'Antibiotic' | 'Painkiller' | 'Antiseptic' | 'Antidiabetic' | 'Antihypertensive' | 'Vitamin' | 'Vaccine' | 'Other'>('Other');
  const [manualStrength, setManualStrength] = useState('');
  const [manualManufacturer, setManualManufacturer] = useState('');
  const [manualPriority, setManualPriority] = useState<'Essential' | 'Critical' | 'Standard'>('Standard');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'tablets' | 'capsules' | 'ml' | 'vials' | 'strips' | 'bottles'>('tablets');
  const [expiryDate, setExpiryDate] = useState('');

  const clinicInventory = inventory.filter(item => item.clinicId === clinic.id);

  const handleAddInventory = () => {
    let medicineId = selectedMedicine;

    if (isManualEntry) {
      if (!manualMedicineName || !manualGenericName || !manualStrength || !manualManufacturer) {
        toast.error('Please fill in all medicine fields');
        return;
      }

      const newMedicine = onAddMedicine({
        name: manualMedicineName,
        genericName: manualGenericName,
        category: manualCategory,
        strength: manualStrength,
        manufacturer: manualManufacturer,
        priority: manualPriority
      });

      medicineId = newMedicine.id;
    }

    if (!medicineId || !batchNumber || !quantity || !expiryDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const expiryDateObj = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: 'In Stock' | 'Low Stock' | 'Expiring Soon' | 'Expired' = 'In Stock';
    if (daysUntilExpiry < 0) status = 'Expired';
    else if (daysUntilExpiry < 90) status = 'Expiring Soon';
    else if (parseInt(quantity) < 500) status = 'Low Stock';

    onAddInventory({
      clinicId: clinic.id,
      medicineId,
      batchNumber,
      quantity: parseInt(quantity),
      unit,
      expiryDate: expiryDateObj,
      status
    });

    toast.success('Inventory item added successfully');
    setOpen(false);
    setSelectedMedicine('');
    setIsManualEntry(false);
    setManualMedicineName('');
    setManualGenericName('');
    setManualStrength('');
    setManualManufacturer('');
    setBatchNumber('');
    setQuantity('');
    setExpiryDate('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Expiring Soon': return 'bg-orange-100 text-orange-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: any) => {
    const realDate = toDate(date);
    return realDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Track and manage your medicine stock</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Medicine
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new medicine to your inventory</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Label>Medicine</Label>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger><SelectValue placeholder="Select medicine" /></SelectTrigger>
                <SelectContent>
                  {medicines.map(med => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.name} ({med.strength})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Batch Number</Label>
              <Input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} />

              <Label>Quantity</Label>
              <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />

              <Label>Expiry Date</Label>
              <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAddInventory}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>{clinicInventory.length} items in stock</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {clinicInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No inventory items yet
                  </TableCell>
                </TableRow>
              ) : (
                clinicInventory.map(item => {
                  const medicine = medicines.find(m => m.id === item.medicineId);
                  const daysUntilExpiry = Math.ceil(
                    (toDate(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{medicine?.name}</TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {formatDate(item.expiryDate)}
                        {daysUntilExpiry > 0 && daysUntilExpiry < 90 && (
                          <span className="text-xs text-orange-600 ml-1">({daysUntilExpiry}d)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
