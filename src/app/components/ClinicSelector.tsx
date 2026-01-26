import { Clinic } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Building2, MapPin } from 'lucide-react';

interface ClinicSelectorProps {
  clinics: Clinic[];
  onSelectClinic: (clinic: Clinic) => void;
}

export function ClinicSelector({ clinics, onSelectClinic }: ClinicSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Inter-Clinic Medicine Inventory Sharing
          </h1>
          <p className="text-lg text-gray-600">
            Connecting clinics to reduce waste and save lives
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Your Clinic</CardTitle>
            <CardDescription>
              Choose your clinic to access the inventory sharing platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {clinics.map((clinic) => (
                <Button
                  key={clinic.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-blue-50"
                  onClick={() => onSelectClinic(clinic)}
                >
                  <div className="flex items-start gap-3 text-left w-full">
                    <Building2 className="w-5 h-5 mt-1 text-blue-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{clinic.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {clinic.location}, {clinic.district}, {clinic.state}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {clinic.type} • {clinic.contactPerson}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo Mode: Select any clinic to explore the platform</p>
        </div>
      </div>
    </div>
  );
}
