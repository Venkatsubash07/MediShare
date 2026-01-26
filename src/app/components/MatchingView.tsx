import { Clinic, InventoryItem, SurplusPosting, MedicineRequest, Medicine, Transfer } from '@/app/types';
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

export function MatchingView({
  clinic,
  clinics,
  inventory,
  surplusPosts,
  requests,
  medicines,
  onRequestTransfer
}: MatchingViewProps) {
  // Find all potential matches
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
            (inventoryItem.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          // Calculate match score based on:
          // - Urgency (40%)
          // - Days until expiry (30%)
          // - Quantity match (30%)
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

    // Sort by match score descending
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  };

  const matches = findMatches();
  
  // Filter matches relevant to the current clinic
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
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
                No matches found at the moment. Check back later or create new requests.
              </p>
            </CardContent>
          </Card>
        ) : (
          relevantMatches.map((match, index) => (
            <Card key={`${match.surplus.id}-${match.request.id}`} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {match.medicine.name}
                      <Badge className={getMatchScoreColor(match.matchScore)}>
                        {match.matchScore}% Match
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {match.medicine.genericName} • {match.medicine.category} • {match.medicine.strength}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* From (Surplus) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      Surplus Available
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-green-200">
                      <div>
                        <div className="font-semibold">{match.fromClinic.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.fromClinic.location}, {match.fromClinic.district}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-medium">
                            {match.surplus.quantity.toLocaleString()} {match.inventoryItem.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batch:</span>
                          <span className="font-mono text-xs">{match.inventoryItem.batchNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className={`flex items-center gap-1 ${
                            match.daysUntilExpiry < 60 ? 'text-orange-600' : 'text-gray-700'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {formatDate(match.inventoryItem.expiryDate)}
                            {match.daysUntilExpiry < 90 && (
                              <span className="text-xs">({match.daysUntilExpiry}d)</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reason:</span>
                          <Badge variant="outline" className="text-xs">
                            {match.surplus.reason}
                          </Badge>
                        </div>
                      </div>
                      {match.surplus.notes && (
                        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          "{match.surplus.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white rounded-full p-2 shadow-md">
                      <ArrowRight className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {/* To (Request) */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      Request Open
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                      <div>
                        <div className="font-semibold">{match.toClinic.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {match.toClinic.location}, {match.toClinic.district}
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Needed:</span>
                          <span className="font-medium">
                            {match.request.quantity.toLocaleString()} {match.request.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Urgency:</span>
                          <Badge 
                            variant="outline"
                            className={
                              match.request.urgency === 'Critical' ? 'border-red-300 text-red-700' :
                              match.request.urgency === 'High' ? 'border-orange-300 text-orange-700' :
                              match.request.urgency === 'Medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }
                          >
                            {match.request.urgency}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requested:</span>
                          <span className="text-xs">{formatDate(match.request.requestedDate)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                        "{match.request.reason}"
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Match Info and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {match.daysUntilExpiry < 60 && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Urgent: Expires soon</span>
                      </div>
                    )}
                    {match.surplus.quantity >= match.request.quantity && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Full quantity available</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {match.fromClinic.id === clinic.id && (
                      <Button variant="outline" size="sm" disabled>
                        Your Surplus
                      </Button>
                    )}
                    {match.toClinic.id === clinic.id && (
                      <Button size="sm" onClick={() => handleRequestTransfer(match)}>
                        Request Transfer
                      </Button>
                    )}
                    {match.fromClinic.id !== clinic.id && match.toClinic.id !== clinic.id && (
                      <Badge variant="secondary">Other Clinics</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* All Matches Count */}
      {matches.length > relevantMatches.length && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800 text-center">
              {matches.length - relevantMatches.length} additional matches available between other clinics in the network
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
