import { useState } from 'react';
import { Clinic, MedicineRequest, Medicine } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface RequestManagementProps {
  clinic: Clinic;
  requests: MedicineRequest[];
  medicines: Medicine[];
  onCreateRequest: (request: Omit<MedicineRequest, 'id' | 'requestedDate'>) => void;
  onCancelRequest: (requestId: string) => void;
}

export function RequestManagement({
  clinic,
  requests,
  medicines,
  onCreateRequest,
  onCancelRequest
}: RequestManagementProps) {
  const [open, setOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'tablets' | 'capsules' | 'ml' | 'vials' | 'strips' | 'bottles'>('tablets');
  const [urgency, setUrgency] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [reason, setReason] = useState('');

  const clinicRequests = requests.filter(req => req.clinicId === clinic.id);

  const handleCreateRequest = () => {
    if (!selectedMedicine || !quantity || !reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    onCreateRequest({
      clinicId: clinic.id,
      medicineId: selectedMedicine,
      quantity: parseInt(quantity),
      unit,
      urgency,
      reason,
      status: 'Open'
    });

    toast.success('Request created successfully');
    setOpen(false);
    setSelectedMedicine('');
    setQuantity('');
    setReason('');
  };

  const handleCancel = (requestId: string) => {
    onCancelRequest(requestId);
    toast.success('Request cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'Matched':
        return 'bg-purple-100 text-purple-800';
      case 'Fulfilled':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
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
          <h2 className="text-2xl font-bold">Medicine Requests</h2>
          <p className="text-muted-foreground">Request medicines from other clinics</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Medicine Request</DialogTitle>
              <DialogDescription>
                Request medicines from other clinics in the network
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="medicine">Medicine</Label>
                <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.name} ({med.strength}) - {med.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Needed</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g., 500"
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
                <Label htmlFor="urgency">Urgency</Label>
                <Select value={urgency} onValueChange={(val) => setUrgency(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you need this medicine..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRequest}>Create Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Requests</CardTitle>
          <CardDescription>
            {clinicRequests.filter(r => r.status === 'Open').length} open requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    No requests yet. Create a request when you need medicines.
                  </TableCell>
                </TableRow>
              ) : (
                clinicRequests.map((request) => {
                  const medicine = medicines.find(m => m.id === request.medicineId);
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {medicine?.name}
                        <div className="text-sm text-muted-foreground">
                          {medicine?.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.quantity.toLocaleString()} {request.unit}
                      </TableCell>
                      <TableCell>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm truncate">{request.reason}</div>
                      </TableCell>
                      <TableCell>{formatDate(request.requestedDate)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.status === 'Open' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(request.id)}
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
