import { useState } from 'react';
import { Clinic } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Building2, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";



interface AuthPageProps {
  clinics: Clinic[];
  onLogin: (clinic: Clinic) => void;
  onRegister: (clinic: Omit<Clinic, 'id'>) => void;
}

export function AuthPage({ clinics, onLogin, onRegister }: AuthPageProps) {
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration state
  const [regName, setRegName] = useState('');
  const [regType, setRegType] = useState<'NGO' | 'Primary Health Center' | 'Charitable Hospital' | 'Mobile Medical Unit'>('NGO');
  const [regLocation, setRegLocation] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regState, setRegState] = useState('');
  const [regContactPerson, setRegContactPerson] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async () => {
  console.log("LOGIN CLICKED");

  if (!loginEmail || !loginPassword) {
    toast.error("Please enter email and password");
    return;
  }

  try {
    // 1️⃣ Firebase authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmail,
      loginPassword
    );

    const user = userCredential.user;

    // 2️⃣ Fetch clinic profile from Firestore
    const clinicRef = doc(db, "clinics", user.uid);
    const clinicSnap = await getDoc(clinicRef);

    if (!clinicSnap.exists()) {
      toast.error("Clinic profile not found");
      return;
    }

    const clinicData = clinicSnap.data();

    // 3️⃣ Send real clinic data to app state
    onLogin({
      id: user.uid,
      ...clinicData,
    } as Clinic);

    toast.success(`Welcome back, ${clinicData.name}!`);

  } catch (error: any) {
    console.error(error);
    toast.error(error.message);
  }
};


const handleRegister = async () => {
  console.log("REGISTER CLICKED");
  if (!regName || !regLocation || !regDistrict || !regState || !regContactPerson || !regPhone || !regEmail || !regPassword) {
    toast.error('Please fill in all fields');
    return;
  }

  try {
    // 1️⃣ Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      regEmail,
      regPassword
    );

    const user = userCredential.user;

    // 2️⃣ Save clinic profile in Firestore
    const newClinic: Omit<Clinic, 'id'> = {
      name: regName,
      type: regType,
      location: regLocation,
      district: regDistrict,
      state: regState,
      contactPerson: regContactPerson,
      phone: regPhone,
      email: regEmail
    };

    await setDoc(doc(db, "clinics", user.uid), newClinic);

    toast.success("Clinic registered successfully! Please login.");

  } catch (error: any) {
    toast.error(error.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MediShare Network
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-4">
            Inter-Clinic Medicine Inventory Sharing Platform
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connecting healthcare providers across India to reduce medicine waste and save lives
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-8">
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <Heart className="h-5 w-5" />
                <span className="text-2xl font-bold">428</span>
              </div>
              <p className="text-sm text-gray-600">Medicines Saved</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <Building2 className="h-5 w-5" />
                <span className="text-2xl font-bold">17</span>
              </div>
              <p className="text-sm text-gray-600">Clinics Connected</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                <Users className="h-5 w-5" />
                <span className="text-2xl font-bold">2,100</span>
              </div>
              <p className="text-sm text-gray-600">Patients Helped</p>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="max-w-md mx-auto shadow-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Login to access your clinic's inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="enter any one demo mail from below"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="type anything and enter"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button className="w-full" onClick={handleLogin}>
                  Login
                </Button>
                <div className="text-sm text-center text-muted-foreground">
                  <p>Demo credentials:</p>
                  <p className="font-mono text-xs mt-1">email:clinic1@test.com</p>
                  <p className="font-mono text-xs mt-1">email:clinic2@test.com</p>
                  <p className="font-mono text-xs mt-1">password:12345678</p>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Register Your Clinic</CardTitle>
                <CardDescription>
                  Join the network to start sharing medicines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Clinic Name *</Label>
                  <Input
                    id="reg-name"
                    placeholder="e.g., Hope Foundation Clinic"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-type">Clinic Type *</Label>
                  <Select value={regType} onValueChange={(val) => setRegType(val as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGO">NGO Clinic</SelectItem>
                      <SelectItem value="Primary Health Center">Primary Health Center</SelectItem>
                      <SelectItem value="Charitable Hospital">Charitable Hospital</SelectItem>
                      <SelectItem value="Mobile Medical Unit">Mobile Medical Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-location">Location *</Label>
                    <Input
                      id="reg-location"
                      placeholder="e.g., Dharavi"
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-district">District *</Label>
                    <Input
                      id="reg-district"
                      placeholder="e.g., Mumbai"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-state">State *</Label>
                  <Input
                    id="reg-state"
                    placeholder="e.g., Maharashtra"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-contact">Contact Person *</Label>
                  <Input
                    id="reg-contact"
                    placeholder="e.g., Dr. Priya Sharma"
                    value={regContactPerson}
                    onChange={(e) => setRegContactPerson(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone Number *</Label>
                  <Input
                    id="reg-phone"
                    placeholder="e.g., +91-9876543210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="clinic@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password *</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleRegister}>
                  Register Clinic
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          
          <p className="mt-1">Reducing pharmaceutical waste • Saving lives</p>
        </div>
      </div>
    </div>
  );
}
