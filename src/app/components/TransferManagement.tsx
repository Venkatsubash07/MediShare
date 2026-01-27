import { Clinic, Transfer, InventoryItem, Medicine } from "@/app/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { CheckCircle2, XCircle, Truck, PackageCheck } from "lucide-react";
import { toast } from "sonner";

interface TransferManagementProps {
  clinic: Clinic;
  clinics: Clinic[];
  transfers: Transfer[];
  inventory: InventoryItem[];
  medicines: Medicine[];
  onApproveTransfer: (transferId: string) => void;
  onRejectTransfer: (transferId: string) => void;
  onCompleteTransfer: (transferId: string) => void;
  onSendTransfer?: (transferId: string) => void;
}

export function TransferManagement({
  clinic,
  clinics,
  transfers,
  inventory,
  medicines,
  onApproveTransfer,
  onRejectTransfer,
  onCompleteTransfer,
  onSendTransfer
}: TransferManagementProps) {

  const incoming = transfers.filter(t => t.toClinicId === clinic.id);
  const outgoing = transfers.filter(t => t.fromClinicId === clinic.id);

  const getClinicName = (id: string) =>
    clinics.find(c => c.id === id)?.name || "Unknown Clinic";

  const getMedicineName = (inventoryItemId: string) => {
    const item = inventory.find(i => i.id === inventoryItemId);
    const med = medicines.find(m => m.id === item?.medicineId);
    return med?.name || "Unknown Medicine";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Approved": return "bg-blue-100 text-blue-800";
      case "In Transit": return "bg-indigo-100 text-indigo-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSend = (id: string) => {
    if (!onSendTransfer) return;
    onSendTransfer(id);
    toast.success("Transfer marked as In Transit");
  };

  return (
    <div className="space-y-8">

      {/* INCOMING TRANSFERS */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Transfers</CardTitle>
          <CardDescription>Transfers coming to your clinic</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incoming.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No incoming transfers
                  </TableCell>
                </TableRow>
              ) : (
                incoming.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{getClinicName(t.fromClinicId)}</TableCell>
                    <TableCell>{getMedicineName(t.inventoryItemId)}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">

                      {t.status === "Pending" && (
                        <>
                          <Button size="sm" onClick={() => onApproveTransfer(t.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onRejectTransfer(t.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {t.status === "In Transit" && (
                        <Button size="sm" onClick={() => onCompleteTransfer(t.id)}>
                          <PackageCheck className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}

                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* OUTGOING TRANSFERS */}
      <Card>
        <CardHeader>
          <CardTitle>Outgoing Transfers</CardTitle>
          <CardDescription>Transfers you are sending to other clinics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>To</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outgoing.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No outgoing transfers
                  </TableCell>
                </TableRow>
              ) : (
                outgoing.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{getClinicName(t.toClinicId)}</TableCell>
                    <TableCell>{getMedicineName(t.inventoryItemId)}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(t.status)}>{t.status}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">

                      {/* SEND BUTTON */}
                      {t.status === "Approved" && (
                        <Button size="sm" onClick={() => handleSend(t.id)}>
                          <Truck className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      )}

                      {/* COMPLETED INFO */}
                      {t.status === "Completed" && (
                        <span className="text-sm text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Delivered
                        </span>
                      )}

                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
