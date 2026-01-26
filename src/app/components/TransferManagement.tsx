import { Clinic, Transfer, InventoryItem, Medicine } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ArrowRight, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface TransferManagementProps {
  clinic: Clinic;
  clinics: Clinic[];
  transfers: Transfer[];
  inventory: InventoryItem[];
  medicines: Medicine[];
  onApproveTransfer: (transferId: string) => void;
  onRejectTransfer: (transferId: string) => void;
  onCompleteTransfer: (transferId: string) => void;
}

export function TransferManagement({
  clinic,
  clinics,
  transfers,
  inventory,
  medicines,
  onApproveTransfer,
  onRejectTransfer,
  onCompleteTransfer
}: TransferManagementProps) {
  const outgoingTransfers = transfers.filter(t => t.fromClinicId === clinic.id);
  const incomingTransfers = transfers.filter(t => t.toClinicId === clinic.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      case 'In Transit':
        return 'bg-purple-100 text-purple-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'In Transit':
        return <Truck className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApprove = (transferId: string) => {
    onApproveTransfer(transferId);
    toast.success('Transfer approved');
  };

  const handleReject = (transferId: string) => {
    onRejectTransfer(transferId);
    toast.error('Transfer rejected');
  };

  const handleComplete = (transferId: string) => {
    onCompleteTransfer(transferId);
    toast.success('Transfer marked as completed');
  };

  const renderTransferRow = (transfer: Transfer, isOutgoing: boolean) => {
    const inventoryItem = inventory.find(i => i.id === transfer.inventoryItemId);
    const medicine = medicines.find(m => m.id === inventoryItem?.medicineId);
    const otherClinic = clinics.find(c => 
      c.id === (isOutgoing ? transfer.toClinicId : transfer.fromClinicId)
    );

    return (
      <TableRow key={transfer.id}>
        <TableCell className="font-medium">
          {medicine?.name}
          <div className="text-sm text-muted-foreground">
            Batch: {inventoryItem?.batchNumber}
          </div>
        </TableCell>
        <TableCell>
          {transfer.quantity.toLocaleString()} {inventoryItem?.unit}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {isOutgoing ? (
              <>
                <span className="text-sm">To:</span>
                <div>
                  <div className="font-medium">{otherClinic?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {otherClinic?.location}
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-sm">From:</span>
                <div>
                  <div className="font-medium">{otherClinic?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {otherClinic?.location}
                  </div>
                </div>
              </>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            <div>Requested: {formatDate(transfer.requestedDate)}</div>
            {transfer.approvedDate && (
              <div className="text-muted-foreground">
                Approved: {formatDate(transfer.approvedDate)}
              </div>
            )}
            {transfer.completedDate && (
              <div className="text-green-600">
                Completed: {formatDate(transfer.completedDate)}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={getStatusColor(transfer.status)}>
            <span className="flex items-center gap-1">
              {getStatusIcon(transfer.status)}
              {transfer.status}
            </span>
          </Badge>
        </TableCell>
        <TableCell>
          {isOutgoing && transfer.status === 'Pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(transfer.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(transfer.id)}
              >
                Reject
              </Button>
            </div>
          )}
          {isOutgoing && transfer.status === 'Approved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleComplete(transfer.id)}
            >
              Mark Complete
            </Button>
          )}
          {!isOutgoing && transfer.status === 'Pending' && (
            <Badge variant="secondary">Awaiting Approval</Badge>
          )}
          {transfer.notes && (
            <div className="text-xs text-muted-foreground mt-1">
              {transfer.notes}
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Transfer Management</h2>
        <p className="text-muted-foreground">Manage incoming and outgoing transfers</p>
      </div>

      <Tabs defaultValue="outgoing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="outgoing">
            Outgoing ({outgoingTransfers.length})
          </TabsTrigger>
          <TabsTrigger value="incoming">
            Incoming ({incomingTransfers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outgoing">
          <Card>
            <CardHeader>
              <CardTitle>Outgoing Transfers</CardTitle>
              <CardDescription>
                Transfers from your clinic to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outgoingTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        <ArrowRight className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        No outgoing transfers
                      </TableCell>
                    </TableRow>
                  ) : (
                    outgoingTransfers.map(transfer => renderTransferRow(transfer, true))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Transfers</CardTitle>
              <CardDescription>
                Transfers coming to your clinic from others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomingTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        <ArrowRight className="h-12 w-12 mx-auto mb-2 opacity-50 transform rotate-180" />
                        No incoming transfers
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomingTransfers.map(transfer => renderTransferRow(transfer, false))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {outgoingTransfers.filter(t => t.status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Require your action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...outgoingTransfers, ...incomingTransfers].filter(
                t => t.status === 'Approved' || t.status === 'In Transit'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Active transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {[...outgoingTransfers, ...incomingTransfers].filter(
                t => t.status === 'Completed'
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Successful transfers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
