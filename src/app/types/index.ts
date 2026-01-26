export interface Clinic {
  id: string;
  name: string;
  type: 'NGO' | 'Primary Health Center' | 'Charitable Hospital' | 'Mobile Medical Unit';
  location: string;
  district: string;
  state: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: 'Antibiotic' | 'Painkiller' | 'Antiseptic' | 'Antidiabetic' | 'Antihypertensive' | 'Vitamin' | 'Vaccine' | 'Other';
  strength: string;
  manufacturer: string;
  priority?: 'Essential' | 'Critical' | 'Standard';
}

export interface InventoryItem {
  id: string;
  clinicId: string;
  medicineId: string;
  batchNumber: string;
  quantity: number;
  unit: 'tablets' | 'capsules' | 'ml' | 'vials' | 'strips' | 'bottles';
  expiryDate: Date;
  status: 'In Stock' | 'Low Stock' | 'Expiring Soon' | 'Expired';
  addedDate: Date;
}

export interface SurplusPosting {
  id: string;
  clinicId: string;
  inventoryItemId: string;
  quantity: number;
  reason: 'Near Expiry' | 'Overstocked' | 'Program Ended' | 'Other';
  notes?: string;
  status: 'Available' | 'Reserved' | 'Transferred' | 'Cancelled';
  postedDate: Date;
}

export interface MedicineRequest {
  id: string;
  clinicId: string;
  medicineId: string;
  quantity: number;
  unit: 'tablets' | 'capsules' | 'ml' | 'vials' | 'strips' | 'bottles';
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  status: 'Open' | 'Matched' | 'Fulfilled' | 'Cancelled';
  requestedDate: Date;
}

export interface Transfer {
  id: string;
  surplusPostingId: string;
  requestId?: string;
  fromClinicId: string;
  toClinicId: string;
  inventoryItemId: string;
  quantity: number;
  status: 'Pending' | 'Approved' | 'In Transit' | 'Completed' | 'Rejected';
  requestedDate: Date;
  approvedDate?: Date;
  completedDate?: Date;
  notes?: string;
}

export interface Match {
  surplusPosting: SurplusPosting;
  request: MedicineRequest;
  inventoryItem: InventoryItem;
  medicine: Medicine;
  fromClinic: Clinic;
  toClinic: Clinic;
  matchScore: number;
  daysUntilExpiry: number;
}

export interface ImpactStats {
  medicinesSaved: number;
  wasteReduced: number; // in kg or units
  transfersCompleted: number;
  clinicsHelped: number;
  estimatedPatients: number;
  estimatedValue: number; // in INR
}