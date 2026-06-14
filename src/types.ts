export interface Patient {
  id: string;
  uhid: string;
  name: string;
  firstName?: string; // For wizard
  lastName?: string;  // For wizard
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  phone?: string;     // Step 1
  dob?: string;       // Step 1
  address?: string;   // Step 1
  ward: string;
  bed: string;
  department: 'Cardiology' | 'Neurology' | 'General' | 'Oncology' | 'Pediatrics' | 'Intensive Care';
  attendingDoctor: string;
  crossConsultant?: string; // Step 2
  status: 'Provisional Admission' | 'MRD Pending' | 'Completed' | 'Discharged';
  labels: ('Payment Defaulter' | 'Insurance' | 'High Priority')[];
  admissionDate?: string; // Step 3
  plan?: 'Basic' | 'Premium' | 'Insurance Covered' | 'None'; // Step 3
  referredBy?: string;   // Step 3
  uploadedDocsCount?: number; // Step 3
  initials: string;
  avatar?: string;
}

export interface MRDFile {
  id: string;
  fileName: string;
  patientName: string;
  uhid: string;
  category: 'Clinical' | 'Imaging' | 'Administrative';
  uploadDate: string;
  status: 'Verified' | 'Pending Review' | 'Flagged';
  securityLevel: 'High' | 'Standard' | 'Restricted';
  fileSize: string;
  authoredBy: string;
  notes: string;
  previewUrl: string; // fallback fallback images
}

export interface ActiveFilters {
  doctor: string;
  department: string;
  statuses: string[];
  startDate: string;
  endDate: string;
  labels: string[];
}
