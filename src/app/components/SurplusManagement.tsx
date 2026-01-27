import { useState } from 'react';
import { Clinic, InventoryItem, SurplusPosting, Medicine } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Plus, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SurplusManagementProps {
  clinic: Clinic;
  inventory: InventoryItem[];
  surplusPosts: SurplusPosting[];
  medicines: Medicine[];
  onPostSurplus: (posting: Omit<SurplusPosting, 'id' | 'postedDate'>) => void;
  onCancelSurplus: (surplusId: string) => void;
}

/* 🔧 Universal Firestore-safe date converter */
const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value.seconds) return new Date(value.seconds * 1000); // Firestore Timestamp
  return new Date(value);
};

export function SurplusManagement({
  clinic,
  inventory,
  surplusPosts,
  medicines,
  onPostSurplus,
  onCancelSurplus
}: SurplusManagementProps) {

  const [open, setOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState<'Near Expiry' | 'Overstocked' | 'Program Ended' | 'Other'>('Near Expiry');
  const [notes, setNotes] = useState('');

  const clinicInventory = inventory.filter(item => item.clinicId === clinic.id);
  const availableForSurplus = clinicInventory.filter(item =>
    item.quantity > 0 && item.status !== 'Expired'
  );
  const clinicSurplus = surplusPosts.filter(post => post.clinicId === clinic.id);

  const handlePostSurplus = () => {
    if (!selectedInventory || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const inventoryItem = clinicInventory.find(item => item.id === selectedInventory);
    if (!inventoryItem) return;

    const quantityNum = parseInt(quantity);
    if (quantityNum > inventoryItem.quantity) {
      toast.error('Quantity exceeds available stock');
      return;
    }

    onPostSurplus({
      clinicId: clinic.id,
      inventoryItemId: selectedInventory,
      quantity: quantityNum,
      reason,
      notes: notes || undefined,
      status: 'Available'
    });

    toast.success('Surplus posted successfully');
    setOpen(false);
    setSelectedInventory('');
    setQuantity('');
    setNotes('');
  };

  const handleCancel = (surplusId: string) => {
    onCancelSurplus(surplusId);
    toast.success('Surplus posting cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'Reserved': return 'bg-blue-100 text-blue-800';
      case 'Transferred': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
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
          <h2 className="text-2xl font-bold">Surplus Management</h2>
          <p className="text-muted-foreground">Post surplus medicines for other clinics</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post Surplus
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post Surplus Medicine</DialogTitle>
              <DialogDescription>
                Share your surplus medicine with other clinics in need
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">

              <Label>Inventory Item</Label>
              <Select value={selectedInventory} onValueChange={setSelectedInventory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inventory item" />
                </SelectTrigger>
                <SelectContent>
                  {availableForSurplus.map(item => {
                    const medicine = medicines.find(m => m.id === item.medicineId);
                    const daysUntilExpiry = Math.ceil(
                      (toDate(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {medicine?.name} - {item.quantity} {item.unit}
                        {daysUntilExpiry < 90 && ` (Expires in ${daysUntilExpiry}d)`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Label>Quantity to Share</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <Label>Reason</Label>
              <Select value={reason} onValueChange={(val) => setReason(val as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Near Expiry">Near Expiry</SelectItem>
                  <SelectItem value="Overstocked">Overstocked</SelectItem>
                  <SelectItem value="Program Ended">Program Ended</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Label>Notes (Optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handlePostSurplus}>Post Surplus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Surplus Postings</CardTitle>
          <CardDescription>
            {clinicSurplus.filter(s => s.status === 'Available').length} active postings
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {clinicSurplus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No surplus postings yet
                  </TableCell>
                </TableRow>
              ) : (
                clinicSurplus.map(posting => {
                  const inventoryItem = inventory.find(i => i.id === posting.inventoryItemId);
                  const medicine = medicines.find(m => m.id === inventoryItem?.medicineId);

                  const daysUntilExpiry = inventoryItem
                    ? Math.ceil(
                        (toDate(inventoryItem.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      )
                    : 0;

                  return (
                    <TableRow key={posting.id}>
                      <TableCell className="font-medium">
                        {medicine?.name}
                        <div className="text-sm text-muted-foreground">
                          Batch: {inventoryItem?.batchNumber}
                        </div>
                      </TableCell>

                      <TableCell>
                        {posting.quantity} {inventoryItem?.unit}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">{posting.reason}</Badge>
                      </TableCell>

                      <TableCell>
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {inventoryItem && formatDate(inventoryItem.expiryDate)}
                        {daysUntilExpiry > 0 && daysUntilExpiry < 90 && (
                          <span className="text-xs text-orange-600 ml-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {daysUntilExpiry}d
                          </span>
                        )}
                      </TableCell>

                      <TableCell>{formatDate(posting.postedDate)}</TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(posting.status)}>
                          {posting.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {posting.status === 'Available' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(posting.id)}
                          >
                            Cancel
                          </Button>
                        )}
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
