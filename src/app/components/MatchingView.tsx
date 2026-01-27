import { Clinic, InventoryItem, SurplusPosting, MedicineRequest, Medicine } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { ArrowRight, Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface MatchingViewProps {
  clinic: Clinic;
  clinics: Clinic[];
  inventory: InventoryItem[];
  surplusPosts: SurplusPosting[];
  requests: MedicineRequest[];
  medicines: Medicine[];
  onRequestTransfer: (surplusId: string, requestId: string) => void;
}

interface Match {
  surplus: SurplusPosting;
  request: MedicineRequest;
  inventoryItem: InventoryItem;
  medicine: Medicine;
  fromClinic: Clinic;
  toClinic: Clinic;
  matchScore: number;
  daysUntilExpiry: number;
}

/* 🔧 Firestore-safe date converter */
const toDate = (value: any): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (value.seconds) return new Date(value.seconds * 1000); // Firestore Timestamp
  return new Date(value);
};

export function MatchingView({
  clinic,
  clinics,
  inventory,
  surplusPosts,
  requests,
  medicines,
  onRequestTransfer
}: MatchingViewProps) {

  const findMatches = (): Match[] => {
    const matches: Match[] = [];
    const availableSurplus = surplusPosts.filter(s => s.status === 'Available');
    const openRequests = requests.filter(r => r.status === 'Open');

    availableSurplus.forEach(surplus => {
      const inventoryItem = inventory.find(i => i.id === surplus.inventoryItemId);
      if (!inventoryItem) return;

      const medicine = medicines.find(m => m.id === inventoryItem.medicineId);
      if (!medicine) return;

      const fromClinic = clinics.find(c => c.id === surplus.clinicId);
      if (!fromClinic) return;

      openRequests.forEach(request => {
        if (request.medicineId === medicine.id) {
          const toClinic = clinics.find(c => c.id === request.clinicId);
          if (!toClinic) return;

          const daysUntilExpiry = Math.ceil(
            (toDate(inventoryItem.expiryDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );

          let urgencyScore = 0;
          switch (request.urgency) {
            case 'Critical': urgencyScore = 100; break;
            case 'High': urgencyScore = 75; break;
            case 'Medium': urgencyScore = 50; break;
            case 'Low': urgencyScore = 25; break;
          }

          const expiryScore = Math.max(0, 100 - (daysUntilExpiry / 90) * 100);
          const quantityRatio = Math.min(surplus.quantity / request.quantity, 1);
          const quantityScore = quantityRatio * 100;

          const matchScore = Math.round(
            urgencyScore * 0.4 + expiryScore * 0.3 + quantityScore * 0.3
          );

          matches.push({
            surplus,
            request,
            inventoryItem,
            medicine,
            fromClinic,
            toClinic,
            matchScore,
            daysUntilExpiry
          });
        }
      });
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  };

  const matches = findMatches();

  const relevantMatches = matches.filter(
    match => match.fromClinic.id === clinic.id || match.toClinic.id === clinic.id
  );

  const handleRequestTransfer = (match: Match) => {
    onRequestTransfer(match.surplus.id, match.request.id);
    toast.success('Transfer request initiated');
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
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
      <div>
        <h2 className="text-2xl font-bold">Smart Matching</h2>
        <p className="text-muted-foreground">
          AI-powered matching between surplus and shortages
        </p>
      </div>

      <div className="grid gap-4">
        {relevantMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-muted-foreground">
                No matches found at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          relevantMatches.map(match => (
            <Card key={`${match.surplus.id}-${match.request.id}`} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  {match.medicine.name}
                  <Badge className={getMatchScoreColor(match.matchScore)}>
                    {match.matchScore}% Match
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {match.medicine.genericName} • {match.medicine.category} • {match.medicine.strength}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">

                  {/* Surplus */}
                  <div>
                    <div className="font-semibold">{match.fromClinic.name}</div>
                    <p className="text-sm">{formatDate(match.inventoryItem.expiryDate)}</p>
                  </div>

                  {/* Request */}
                  <div>
                    <div className="font-semibold">{match.toClinic.name}</div>
                    <p className="text-sm">{formatDate(match.request.requestedDate)}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-end">
                  {match.toClinic.id === clinic.id && (
                    <Button size="sm" onClick={() => handleRequestTransfer(match)}>
                      Request Transfer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
