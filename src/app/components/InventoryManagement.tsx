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

    // If manual entry, create a new medicine first
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
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expiring Soon':
        return 'bg-orange-100 text-orange-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
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
              <DialogDescription>
                Add a new medicine to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="medicine">Medicine</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsManualEntry(!isManualEntry);
                      setSelectedMedicine('');
                    }}
                  >
                    {isManualEntry ? 'Select from list' : 'Enter manually'}
                  </Button>
                </div>
                {!isManualEntry ? (
                  <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} ({med.strength}) - {med.category}
                          {med.priority && ` [${med.priority}]`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="manual-name">Medicine Name *</Label>
                        <Input
                          id="manual-name"
                          value={manualMedicineName}
                          onChange={(e) => setManualMedicineName(e.target.value)}
                          placeholder="e.g., Paracetamol"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manual-generic">Generic Name *</Label>
                        <Input
                          id="manual-generic"
                          value={manualGenericName}
                          onChange={(e) => setManualGenericName(e.target.value)}
                          placeholder="e.g., Acetaminophen"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="manual-category">Category *</Label>
                        <Select value={manualCategory} onValueChange={(val) => setManualCategory(val as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                            <SelectItem value="Painkiller">Painkiller</SelectItem>
                            <SelectItem value="Antiseptic">Antiseptic</SelectItem>
                            <SelectItem value="Antidiabetic">Antidiabetic</SelectItem>
                            <SelectItem value="Antihypertensive">Antihypertensive</SelectItem>
                            <SelectItem value="Vitamin">Vitamin</SelectItem>
                            <SelectItem value="Vaccine">Vaccine</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manual-priority">Priority *</Label>
                        <Select value={manualPriority} onValueChange={(val) => setManualPriority(val as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Critical">Critical (Life-saving)</SelectItem>
                            <SelectItem value="Essential">Essential</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="manual-strength">Strength *</Label>
                        <Input
                          id="manual-strength"
                          value={manualStrength}
                          onChange={(e) => setManualStrength(e.target.value)}
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manual-manufacturer">Manufacturer *</Label>
                        <Input
                          id="manual-manufacturer"
                          value={manualManufacturer}
                          onChange={(e) => setManualManufacturer(e.target.value)}
                          placeholder="e.g., Sun Pharma"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch Number</Label>
                <Input
                  id="batch"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g., AMX2024-001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={unit} onValueChange={(val) => setUnit(val as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="capsules">Capsules</SelectItem>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="vials">Vials</SelectItem>
                      <SelectItem value="strips">Strips</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddInventory}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
          <CardDescription>
            {clinicInventory.length} items in stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No inventory items yet. Add your first item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                clinicInventory.map((item) => {
                  const medicine = medicines.find(m => m.id === item.medicineId);
                  const daysUntilExpiry = Math.ceil(
                    (item.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {medicine?.name}
                        <div className="text-sm text-muted-foreground">
                          {medicine?.strength}
                        </div>
                      </TableCell>
                      <TableCell>{medicine?.category}</TableCell>
                      <TableCell className="font-mono text-sm">{item.batchNumber}</TableCell>
                      <TableCell>
                        {item.quantity.toLocaleString()} {item.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(item.expiryDate)}
                          {daysUntilExpiry > 0 && daysUntilExpiry < 90 && (
                            <span className="text-xs text-orange-600">
                              ({daysUntilExpiry}d)
                            </span>
                          )}
                        </div>
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