import { Clinic, Medicine, InventoryItem, SurplusPosting, MedicineRequest, Transfer } from '@/app/types';

export const mockClinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Seva Sadan NGO Clinic',
    type: 'NGO',
    location: 'Dharavi',
    district: 'Mumbai',
    state: 'Maharashtra',
    contactPerson: 'Dr. Priya Sharma',
    phone: '+91-9876543210',
    email: 'priya@sevasadan.org'
  },
  {
    id: 'clinic-2',
    name: 'Gram Swasthya Kendra',
    type: 'Primary Health Center',
    location: 'Kusumpur',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    contactPerson: 'Dr. Rajesh Kumar',
    phone: '+91-9876543211',
    email: 'rajesh@gramswasthya.gov.in'
  },
  {
    id: 'clinic-3',
    name: 'Hope Foundation Hospital',
    type: 'Charitable Hospital',
    location: 'Indiranagar',
    district: 'Bangalore',
    state: 'Karnataka',
    contactPerson: 'Dr. Anjali Menon',
    phone: '+91-9876543212',
    email: 'anjali@hopefoundation.org'
  },
  {
    id: 'clinic-4',
    name: 'Mobile Health Unit - Rural',
    type: 'Mobile Medical Unit',
    location: 'Mehsana District',
    district: 'Mehsana',
    state: 'Gujarat',
    contactPerson: 'Dr. Vikram Patel',
    phone: '+91-9876543213',
    email: 'vikram@mobilehealthgj.org'
  },
  {
    id: 'clinic-5',
    name: 'Asha Community Clinic',
    type: 'NGO',
    location: 'Bhubaneswar',
    district: 'Khordha',
    state: 'Odisha',
    contactPerson: 'Dr. Sunita Das',
    phone: '+91-9876543214',
    email: 'sunita@ashaclinic.org'
  }
];

export const mockMedicines: Medicine[] = [
  {
    id: 'med-1',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'Antibiotic',
    strength: '500mg',
    manufacturer: 'Cipla',
    priority: 'Essential'
  },
  {
    id: 'med-2',
    name: 'Paracetamol',
    genericName: 'Paracetamol',
    category: 'Painkiller',
    strength: '650mg',
    manufacturer: 'Sun Pharma',
    priority: 'Essential'
  },
  {
    id: 'med-3',
    name: 'Metformin',
    genericName: 'Metformin HCL',
    category: 'Antidiabetic',
    strength: '500mg',
    manufacturer: 'Dr. Reddy\'s',
    priority: 'Critical'
  },
  {
    id: 'med-4',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    category: 'Antihypertensive',
    strength: '5mg',
    manufacturer: 'Lupin',
    priority: 'Critical'
  },
  {
    id: 'med-5',
    name: 'Azithromycin',
    genericName: 'Azithromycin',
    category: 'Antibiotic',
    strength: '250mg',
    manufacturer: 'Cipla',
    priority: 'Essential'
  },
  {
    id: 'med-6',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    category: 'Painkiller',
    strength: '400mg',
    manufacturer: 'Ranbaxy',
    priority: 'Standard'
  },
  {
    id: 'med-7',
    name: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    category: 'Antibiotic',
    strength: '500mg',
    manufacturer: 'Sun Pharma',
    priority: 'Essential'
  },
  {
    id: 'med-8',
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    category: 'Vitamin',
    strength: '60000 IU',
    manufacturer: 'Mankind',
    priority: 'Standard'
  },
  {
    id: 'med-9',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin',
    category: 'Antihypertensive',
    strength: '10mg',
    manufacturer: 'Torrent',
    priority: 'Critical'
  },
  {
    id: 'med-10',
    name: 'Povidone Iodine',
    genericName: 'Povidone Iodine',
    category: 'Antiseptic',
    strength: '10% w/v',
    manufacturer: 'Win-Medicare',
    priority: 'Standard'
  }
];

// Helper to create dates relative to today
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const mockInventory: InventoryItem[] = [
  // Clinic 1 - Seva Sadan (has surplus)
  {
    id: 'inv-1',
    clinicId: 'clinic-1',
    medicineId: 'med-1',
    batchNumber: 'AMX2024-001',
    quantity: 2000,
    unit: 'tablets',
    expiryDate: daysFromNow(45),
    status: 'Expiring Soon',
    addedDate: daysFromNow(-180)
  },
  {
    id: 'inv-2',
    clinicId: 'clinic-1',
    medicineId: 'med-5',
    batchNumber: 'AZT2024-005',
    quantity: 500,
    unit: 'tablets',
    expiryDate: daysFromNow(30),
    status: 'Expiring Soon',
    addedDate: daysFromNow(-150)
  },
  {
    id: 'inv-3',
    clinicId: 'clinic-1',
    medicineId: 'med-2',
    batchNumber: 'PCM2025-020',
    quantity: 5000,
    unit: 'tablets',
    expiryDate: daysFromNow(240),
    status: 'In Stock',
    addedDate: daysFromNow(-60)
  },
  // Clinic 2 - Gram Swasthya (needs medicines)
  {
    id: 'inv-4',
    clinicId: 'clinic-2',
    medicineId: 'med-2',
    batchNumber: 'PCM2024-010',
    quantity: 200,
    unit: 'tablets',
    expiryDate: daysFromNow(90),
    status: 'Low Stock',
    addedDate: daysFromNow(-90)
  },
  {
    id: 'inv-5',
    clinicId: 'clinic-2',
    medicineId: 'med-3',
    batchNumber: 'MET2024-012',
    quantity: 150,
    unit: 'tablets',
    expiryDate: daysFromNow(120),
    status: 'Low Stock',
    addedDate: daysFromNow(-100)
  },
  // Clinic 3 - Hope Foundation (has surplus)
  {
    id: 'inv-6',
    clinicId: 'clinic-3',
    medicineId: 'med-7',
    batchNumber: 'CIP2024-008',
    quantity: 1500,
    unit: 'tablets',
    expiryDate: daysFromNow(60),
    status: 'Expiring Soon',
    addedDate: daysFromNow(-120)
  },
  {
    id: 'inv-7',
    clinicId: 'clinic-3',
    medicineId: 'med-4',
    batchNumber: 'AML2025-015',
    quantity: 3000,
    unit: 'tablets',
    expiryDate: daysFromNow(300),
    status: 'In Stock',
    addedDate: daysFromNow(-30)
  },
  {
    id: 'inv-8',
    clinicId: 'clinic-3',
    medicineId: 'med-8',
    batchNumber: 'VTD2024-003',
    quantity: 200,
    unit: 'capsules',
    expiryDate: daysFromNow(40),
    status: 'Expiring Soon',
    addedDate: daysFromNow(-200)
  },
  // Clinic 4 - Mobile Health Unit (needs medicines)
  {
    id: 'inv-9',
    clinicId: 'clinic-4',
    medicineId: 'med-6',
    batchNumber: 'IBU2024-007',
    quantity: 100,
    unit: 'tablets',
    expiryDate: daysFromNow(150),
    status: 'Low Stock',
    addedDate: daysFromNow(-80)
  },
  // Clinic 5 - Asha Community (balanced)
  {
    id: 'inv-10',
    clinicId: 'clinic-5',
    medicineId: 'med-9',
    batchNumber: 'ATO2025-011',
    quantity: 1000,
    unit: 'tablets',
    expiryDate: daysFromNow(280),
    status: 'In Stock',
    addedDate: daysFromNow(-45)
  }
];

export const mockSurplusPosts: SurplusPosting[] = [
  {
    id: 'surplus-1',
    clinicId: 'clinic-1',
    inventoryItemId: 'inv-1',
    quantity: 1500,
    reason: 'Near Expiry',
    notes: 'Overstocked due to decreased patient visits. Medicine expires in 45 days.',
    status: 'Available',
    postedDate: daysFromNow(-5)
  },
  {
    id: 'surplus-2',
    clinicId: 'clinic-1',
    inventoryItemId: 'inv-2',
    quantity: 300,
    reason: 'Near Expiry',
    notes: 'Program for respiratory infections ended. Expires in 30 days.',
    status: 'Available',
    postedDate: daysFromNow(-3)
  },
  {
    id: 'surplus-3',
    clinicId: 'clinic-3',
    inventoryItemId: 'inv-6',
    quantity: 1000,
    reason: 'Overstocked',
    notes: 'Received duplicate donation. Expires in 60 days.',
    status: 'Available',
    postedDate: daysFromNow(-7)
  },
  {
    id: 'surplus-4',
    clinicId: 'clinic-3',
    inventoryItemId: 'inv-8',
    quantity: 150,
    reason: 'Near Expiry',
    notes: 'Low demand in current season. Expires in 40 days.',
    status: 'Available',
    postedDate: daysFromNow(-2)
  }
];

export const mockRequests: MedicineRequest[] = [
  {
    id: 'req-1',
    clinicId: 'clinic-2',
    medicineId: 'med-1',
    quantity: 1000,
    unit: 'tablets',
    urgency: 'High',
    reason: 'Seasonal infection outbreak in rural area. Current stock critically low.',
    status: 'Open',
    requestedDate: daysFromNow(-4)
  },
  {
    id: 'req-2',
    clinicId: 'clinic-2',
    medicineId: 'med-7',
    quantity: 500,
    unit: 'tablets',
    urgency: 'Medium',
    reason: 'Regular replenishment needed for primary care services.',
    status: 'Open',
    requestedDate: daysFromNow(-6)
  },
  {
    id: 'req-3',
    clinicId: 'clinic-4',
    medicineId: 'med-5',
    quantity: 200,
    unit: 'tablets',
    urgency: 'Critical',
    reason: 'Mobile camp in remote village next week. Stock depleted.',
    status: 'Open',
    requestedDate: daysFromNow(-1)
  },
  {
    id: 'req-4',
    clinicId: 'clinic-4',
    medicineId: 'med-8',
    quantity: 100,
    unit: 'capsules',
    urgency: 'Low',
    reason: 'Nutrition program for pregnant women in tribal areas.',
    status: 'Open',
    requestedDate: daysFromNow(-8)
  }
];

export const mockTransfers: Transfer[] = [
  {
    id: 'trans-1',
    surplusPostingId: 'surplus-1',
    requestId: 'req-1',
    fromClinicId: 'clinic-1',
    toClinicId: 'clinic-2',
    inventoryItemId: 'inv-1',
    quantity: 1000,
    status: 'Pending',
    requestedDate: daysFromNow(-1),
    notes: 'Urgent transfer needed for outbreak management'
  },
  {
    id: 'trans-2',
    surplusPostingId: 'surplus-3',
    requestId: 'req-2',
    fromClinicId: 'clinic-3',
    toClinicId: 'clinic-2',
    inventoryItemId: 'inv-6',
    quantity: 500,
    status: 'Approved',
    requestedDate: daysFromNow(-2),
    approvedDate: daysFromNow(-1),
    notes: 'Approved for transfer via courier service'
  },
  {
    id: 'trans-3',
    surplusPostingId: 'surplus-2',
    requestId: 'req-3',
    fromClinicId: 'clinic-1',
    toClinicId: 'clinic-4',
    inventoryItemId: 'inv-2',
    quantity: 200,
    status: 'Completed',
    requestedDate: daysFromNow(-5),
    approvedDate: daysFromNow(-4),
    completedDate: daysFromNow(-2),
    notes: 'Successfully delivered to mobile unit'
  }
];

// Helper function to calculate impact stats
export const calculateImpactStats = (transfers: Transfer[]): {
  medicinesSaved: number;
  wasteReduced: number;
  transfersCompleted: number;
  clinicsHelped: number;
  estimatedPatients: number;
  estimatedValue: number;
} => {
  const completedTransfers = transfers.filter(t => t.status === 'Completed');
  const totalQuantity = completedTransfers.reduce((sum, t) => sum + t.quantity, 0);
  const uniqueClinics = new Set(completedTransfers.map(t => t.toClinicId));
  
  return {
    medicinesSaved: totalQuantity,
    wasteReduced: Math.round(totalQuantity * 0.5), // Approximate weight in grams
    transfersCompleted: completedTransfers.length,
    clinicsHelped: uniqueClinics.size,
    estimatedPatients: Math.round(totalQuantity / 10), // Avg 10 tablets per patient
    estimatedValue: Math.round(totalQuantity * 3.5) // Avg ₹3.5 per tablet
  };
};