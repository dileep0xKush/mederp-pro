import { create } from 'zustand';
import {
  User,
  UserRole,
  Product,
  Batch,
  InventoryTransaction,
  Supplier,
  Customer,
  PurchaseOrder,
  GRN,
  SalesInvoice,
  Doctor,
  VisitRecord,
  MRReport,
  MRTourPlan,
  GiftInventoryItem,
  GiftAllocation,
  LedgerEntry,
  AuditLog,
  Notification,
  ApiKey,
  SessionActivity
} from '../types';

interface AppState {
  // Authentication & Session
  currentUser: User | null;
  activeRole: UserRole;
  sessions: SessionActivity[];
  apiKeys: ApiKey[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  
  // Data lists
  products: Product[];
  batches: Batch[];
  inventoryTransactions: InventoryTransaction[];
  suppliers: Supplier[];
  customers: Customer[];
  purchaseOrders: PurchaseOrder[];
  grns: GRN[];
  salesInvoices: SalesInvoice[];
  doctors: Doctor[];
  visitRecords: VisitRecord[];
  mrReports: MRReport[];
  mrTourPlans: MRTourPlan[];
  giftInventory: GiftInventoryItem[];
  giftAllocations: GiftAllocation[];
  ledger: LedgerEntry[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  setActiveRole: (role: UserRole) => void;
  enable2FA: (secret: string) => void;
  disable2FA: () => void;
  
  // Notification Actions
  addNotification: (type: Notification['type'], title: string, message: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Audit Actions
  logActivity: (action: string, details: string) => void;
  
  // Api Key Actions
  generateApiKey: (name: string) => void;
  revokeApiKey: (id: string) => void;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'stockLevel'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Batch Actions
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;

  // Inventory Transactions
  addInventoryTransaction: (tx: Omit<InventoryTransaction, 'id' | 'date' | 'performedBy'>) => void;

  // Supplier / Customer
  addSupplier: (supplier: Omit<Supplier, 'id' | 'outstandingAmount'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'outstandingAmount'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  // Invoice / Orders
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'date' | 'status'>) => void;
  receiveGRN: (grn: Omit<GRN, 'id' | 'grnNumber' | 'date' | 'status'>) => void;
  createSalesInvoice: (invoice: Omit<SalesInvoice, 'id' | 'invoiceNumber' | 'date' | 'outstandingAmount' | 'status'>) => void;
  payInvoice: (invoiceId: string, amount: number) => void;

  // Doctor CRM
  addDoctor: (doctor: Omit<Doctor, 'id' | 'visitsCount' | 'prescribingMolecules'>) => void;
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;
  logDoctorVisit: (visit: Omit<VisitRecord, 'id' | 'date' | 'mrId' | 'mrName'>) => void;

  // MR management
  submitMRReport: (report: Omit<MRReport, 'id' | 'date' | 'mrId' | 'mrName' | 'status'>) => void;
  approveMRReport: (id: string) => void;
  rejectMRReport: (id: string) => void;
  submitTourPlan: (plan: Omit<MRTourPlan, 'id' | 'mrId' | 'mrName' | 'status'>) => void;
  approveTourPlan: (id: string) => void;
  rejectTourPlan: (id: string) => void;

  // Gift Allocation
  allocateGift: (allocation: Omit<GiftAllocation, 'id' | 'dateAllocated' | 'distributedQty'>) => void;

  // Ledger Action
  postLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'date' | 'balance'>) => void;
}

// Initial Seeding Data
const initialUser: User = {
  id: 'usr-101',
  name: 'Dr. Vikram Mehra',
  email: 'vikram@mederppro.com',
  role: 'Super Admin',
  mobile: '+91 98765 43210',
  companyName: 'MedERP Pro Healthcare Solutions Ltd',
  avatarUrl: '/avatars/admin.jpg',
  is2FAEnabled: false,
  createdAt: '2026-01-01T10:00:00Z',
  lastLogin: '2026-06-11T22:00:00Z'
};

const initialSessions: SessionActivity[] = [
  {
    id: 'sess-1',
    device: 'MacBook Pro (Chrome / macOS)',
    ipAddress: '192.168.1.15',
    location: 'Delhi, India',
    lastActive: 'Just now',
    isCurrent: true
  },
  {
    id: 'sess-2',
    device: 'iPhone 15 Pro (Safari / iOS)',
    ipAddress: '103.45.2.110',
    location: 'Noida, India',
    lastActive: '5 hours ago',
    isCurrent: false
  }
];

const initialApiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Integrations - Shopify Pharmacy Store',
    keyPrefix: 'mep_live_abc123...',
    createdDate: '2026-02-15T08:30:00Z',
    lastUsedDate: '2026-06-11T18:24:00Z',
    status: 'Active'
  },
  {
    id: 'key-2',
    name: 'MR App Sync Token',
    keyPrefix: 'mep_live_mr908x...',
    createdDate: '2026-04-10T12:00:00Z',
    lastUsedDate: '2026-06-11T21:45:00Z',
    status: 'Active'
  }
];

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    brandName: 'Ciprodac 500',
    genericName: 'Ciprofloxacin',
    molecule: 'Fluoroquinolones',
    strength: '500mg',
    dosageForm: 'Tablet',
    packing: '10x10 Tablets',
    manufacturer: 'Cipla Ltd',
    supplierId: 'supp-1',
    supplierName: 'Cipla Distributors',
    hsnCode: '30049011',
    gstPercent: 12,
    tradeRate: 45.0,
    mrp: 78.0,
    doctorGiftScheme: '10+1 Promo',
    status: 'Active',
    createdAt: '2026-01-10T00:00:00Z',
    stockLevel: 1200
  },
  {
    id: 'prod-2',
    brandName: 'Paracip 650',
    genericName: 'Paracetamol',
    molecule: 'Analgesic & Antipyretic',
    strength: '650mg',
    dosageForm: 'Tablet',
    packing: '15x10 Tablets',
    manufacturer: 'Cipla Ltd',
    supplierId: 'supp-1',
    supplierName: 'Cipla Distributors',
    hsnCode: '30049012',
    gstPercent: 12,
    tradeRate: 12.0,
    mrp: 24.50,
    doctorGiftScheme: 'None',
    status: 'Active',
    createdAt: '2026-01-10T00:00:00Z',
    stockLevel: 4500
  },
  {
    id: 'prod-3',
    brandName: 'Augmentin 625 DUO',
    genericName: 'Amoxicillin + Clavulanic Acid',
    molecule: 'Penicillin Antibiotics',
    strength: '625mg',
    dosageForm: 'Tablet',
    packing: '1x6 Tablets',
    manufacturer: 'GlaxoSmithKline',
    supplierId: 'supp-3',
    supplierName: 'GSK India Trading',
    hsnCode: '30049013',
    gstPercent: 18,
    tradeRate: 110.0,
    mrp: 180.0,
    doctorGiftScheme: 'Buy 50 Get 3 Free',
    status: 'Active',
    createdAt: '2026-01-12T00:00:00Z',
    stockLevel: 800
  },
  {
    id: 'prod-4',
    brandName: 'Pantocid 40',
    genericName: 'Pantoprazole',
    molecule: 'Proton Pump Inhibitors',
    strength: '40mg',
    dosageForm: 'Tablet',
    packing: '10x15 Tablets',
    manufacturer: 'Sun Pharma',
    supplierId: 'supp-2',
    supplierName: 'Sun Pharma Distributors',
    hsnCode: '30049014',
    gstPercent: 12,
    tradeRate: 68.0,
    mrp: 115.0,
    doctorGiftScheme: 'None',
    status: 'Active',
    createdAt: '2026-01-15T00:00:00Z',
    stockLevel: 2500
  },
  {
    id: 'prod-5',
    brandName: 'Atorva 10',
    genericName: 'Atorvastatin',
    molecule: 'HMG-CoA Reductase Inhibitor',
    strength: '10mg',
    dosageForm: 'Tablet',
    packing: '10x10 Tablets',
    manufacturer: 'Zydus Cadila',
    supplierId: 'supp-2',
    supplierName: 'Sun Pharma Distributors',
    hsnCode: '30049015',
    gstPercent: 12,
    tradeRate: 32.0,
    mrp: 62.0,
    doctorGiftScheme: '20+1 Scheme',
    status: 'Active',
    createdAt: '2026-02-01T00:00:00Z',
    stockLevel: 3200
  },
  {
    id: 'prod-6',
    brandName: 'Glycomet GP2',
    genericName: 'Metformin + Glimepiride',
    molecule: 'Biguanide & Sulfonylurea',
    strength: '500mg/2mg',
    dosageForm: 'Tablet',
    packing: '10x15 Tablets',
    manufacturer: 'USV Pvt Ltd',
    supplierId: 'supp-1',
    supplierName: 'Cipla Distributors',
    hsnCode: '30049016',
    gstPercent: 12,
    tradeRate: 55.0,
    mrp: 98.0,
    doctorGiftScheme: '15+1 Scheme',
    status: 'Active',
    createdAt: '2026-02-05T00:00:00Z',
    stockLevel: 1500
  },
  {
    id: 'prod-7',
    brandName: 'Montair LC',
    genericName: 'Montelukast + Levocetirizine',
    molecule: 'Leukotriene Receptor Antagonist',
    strength: '10mg/5mg',
    dosageForm: 'Tablet',
    packing: '10x10 Tablets',
    manufacturer: 'Cipla Ltd',
    supplierId: 'supp-1',
    supplierName: 'Cipla Distributors',
    hsnCode: '30049017',
    gstPercent: 12,
    tradeRate: 85.0,
    mrp: 145.0,
    doctorGiftScheme: 'None',
    status: 'Active',
    createdAt: '2026-02-10T00:00:00Z',
    stockLevel: 90
  }
];

const initialBatches: Batch[] = [
  {
    id: 'bat-1',
    productId: 'prod-1',
    productName: 'Ciprodac 500',
    brandName: 'Ciprodac 500',
    batchNumber: 'B-CP902',
    quantity: 1200,
    manufacturingDate: '2025-05-10',
    expiryDate: '2027-04-12',
    tradeRate: 45.0,
    mrp: 78.0,
    availableQuantity: 400,
    status: 'Normal'
  },
  {
    id: 'bat-2',
    productId: 'prod-1',
    productName: 'Ciprodac 500',
    brandName: 'Ciprodac 500',
    batchNumber: 'B-CP903',
    quantity: 800,
    manufacturingDate: '2024-08-01',
    expiryDate: '2026-07-20', // Near expiry
    tradeRate: 45.0,
    mrp: 78.0,
    availableQuantity: 800,
    status: 'Near Expiry'
  },
  {
    id: 'bat-3',
    productId: 'prod-2',
    productName: 'Paracip 650',
    brandName: 'Paracip 650',
    batchNumber: 'B-PC102',
    quantity: 2000,
    manufacturingDate: '2025-12-01',
    expiryDate: '2028-01-15',
    tradeRate: 12.0,
    mrp: 24.50,
    availableQuantity: 2000,
    status: 'Normal'
  },
  {
    id: 'bat-4',
    productId: 'prod-2',
    productName: 'Paracip 650',
    brandName: 'Paracip 650',
    batchNumber: 'B-PC101',
    quantity: 2500,
    manufacturingDate: '2023-04-15',
    expiryDate: '2026-03-10', // Expired
    tradeRate: 12.0,
    mrp: 24.50,
    availableQuantity: 2500,
    status: 'Expired'
  },
  {
    id: 'bat-5',
    productId: 'prod-3',
    productName: 'Augmentin 625 DUO',
    brandName: 'Augmentin 625 DUO',
    batchNumber: 'B-AG882',
    quantity: 800,
    manufacturingDate: '2025-10-10',
    expiryDate: '2027-10-05',
    tradeRate: 110.0,
    mrp: 180.0,
    availableQuantity: 800,
    status: 'Normal'
  },
  {
    id: 'bat-6',
    productId: 'prod-4',
    productName: 'Pantocid 40',
    brandName: 'Pantocid 40',
    batchNumber: 'B-PT011',
    quantity: 2500,
    manufacturingDate: '2024-09-01',
    expiryDate: '2026-09-15', // Near expiry
    tradeRate: 68.0,
    mrp: 115.0,
    availableQuantity: 2500,
    status: 'Near Expiry'
  },
  {
    id: 'bat-7',
    productId: 'prod-5',
    productName: 'Atorva 10',
    brandName: 'Atorva 10',
    batchNumber: 'B-AT052',
    quantity: 3200,
    manufacturingDate: '2025-05-01',
    expiryDate: '2028-04-30',
    tradeRate: 32.0,
    mrp: 62.0,
    availableQuantity: 3200,
    status: 'Normal'
  },
  {
    id: 'bat-8',
    productId: 'prod-6',
    productName: 'Glycomet GP2',
    brandName: 'Glycomet GP2',
    batchNumber: 'B-GM204',
    quantity: 1500,
    manufacturingDate: '2025-12-05',
    expiryDate: '2027-11-22',
    tradeRate: 55.0,
    mrp: 98.0,
    availableQuantity: 1500,
    status: 'Normal'
  },
  {
    id: 'bat-9',
    productId: 'prod-7',
    productName: 'Montair LC',
    brandName: 'Montair LC',
    batchNumber: 'B-MLC88',
    quantity: 1000,
    manufacturingDate: '2024-08-15',
    expiryDate: '2026-08-10', // Near expiry & low stock
    tradeRate: 85.0,
    mrp: 145.0,
    availableQuantity: 90,
    status: 'Low Stock'
  }
];

const initialTransactions: InventoryTransaction[] = [
  {
    id: 'tx-1',
    date: '2026-06-01T10:30:00Z',
    type: 'Stock In',
    productId: 'prod-3',
    productName: 'Augmentin 625 DUO',
    batchNumber: 'B-AG882',
    quantity: 800,
    targetWarehouse: 'Warehouse Alpha (Main)',
    referenceNumber: 'GRN-2026-004',
    performedBy: 'Store Manager',
    remarks: 'Received fresh consignment from GSK'
  },
  {
    id: 'tx-2',
    date: '2026-06-05T14:20:00Z',
    type: 'Stock Out',
    productId: 'prod-1',
    productName: 'Ciprodac 500',
    batchNumber: 'B-CP902',
    quantity: 150,
    sourceWarehouse: 'Warehouse Alpha (Main)',
    referenceNumber: 'INV-2026-088',
    performedBy: 'Sales Manager',
    remarks: 'Dispatched to Apollo Pharmacy'
  },
  {
    id: 'tx-3',
    date: '2026-06-08T11:00:00Z',
    type: 'Stock Transfer',
    productId: 'prod-2',
    productName: 'Paracip 650',
    batchNumber: 'B-PC102',
    quantity: 500,
    sourceWarehouse: 'Warehouse Alpha (Main)',
    targetWarehouse: 'Sub-Depot Beta',
    referenceNumber: 'TR-2026-012',
    performedBy: 'Store Manager',
    remarks: 'Inter-warehouse stock replenishment'
  },
  {
    id: 'tx-4',
    date: '2026-06-10T16:00:00Z',
    type: 'Stock Adjustment',
    productId: 'prod-7',
    productName: 'Montair LC',
    batchNumber: 'B-MLC88',
    quantity: -10,
    sourceWarehouse: 'Warehouse Alpha (Main)',
    referenceNumber: 'ADJ-2026-003',
    performedBy: 'Store Manager',
    remarks: 'Discarded damaged blister packs'
  }
];

const initialSuppliers: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Cipla Distributors Ltd',
    contactPerson: 'Arvind Swamy',
    mobile: '+91 99887 76655',
    email: 'contact@cipladist.com',
    gstIn: '07AAAAA1111A1Z1',
    address: 'Phase-1, Okhla Industrial Area',
    city: 'New Delhi',
    outstandingAmount: 12450.0,
    status: 'Active'
  },
  {
    id: 'supp-2',
    name: 'Sun Pharma Distributors',
    contactPerson: 'Manoj Bajpayee',
    mobile: '+91 98989 89898',
    email: 'delhi.sales@sunpharma.com',
    gstIn: '07BBBBB2222B2Z2',
    address: 'Connaught Place, Regal Building',
    city: 'Delhi',
    outstandingAmount: 8400.0,
    status: 'Active'
  },
  {
    id: 'supp-3',
    name: 'GSK India Trading Corp',
    contactPerson: 'Sanjay Dutt',
    mobile: '+91 97979 79797',
    email: 'billing@gsktrade.in',
    gstIn: '07CCCCC3333C3Z3',
    address: 'Udyog Vihar, Phase IV',
    city: 'Gurugram',
    outstandingAmount: 0.0,
    status: 'Active'
  }
];

const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Apollo Pharmacy #101',
    type: 'Stockist',
    contactPerson: 'Harish Rawat',
    mobile: '+91 96543 21098',
    email: 'ap-101@apollopharmacy.com',
    gstIn: '07DDDDD4444D4Z4',
    address: 'Greater Kailash, Part 2',
    city: 'New Delhi',
    outstandingAmount: 45600.0,
    creditLimit: 100000.0,
    status: 'Active'
  },
  {
    id: 'cust-2',
    name: 'MedPlus Pharmacy - Saket',
    type: 'Retailer',
    contactPerson: 'Lokesh Sharma',
    mobile: '+91 95432 10987',
    email: 'saket@medplusstore.com',
    gstIn: '07EEEEE5555E5Z5',
    address: 'Saket District Centre, PVR Complex',
    city: 'New Delhi',
    outstandingAmount: 18200.0,
    creditLimit: 50000.0,
    status: 'Active'
  },
  {
    id: 'cust-3',
    name: 'LifeCare Distributors',
    type: 'Distributor',
    contactPerson: 'Ramanathan Iyer',
    mobile: '+91 94321 09876',
    email: 'raman@lifecaredist.com',
    gstIn: '07FFFFF6666F6Z6',
    address: 'Lajpat Nagar, Block K',
    city: 'Delhi',
    outstandingAmount: 0.0,
    creditLimit: 250000.0,
    status: 'Active'
  }
];

const initialSalesInvoices: SalesInvoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-088',
    customerId: 'cust-1',
    customerName: 'Apollo Pharmacy #101',
    date: '2026-06-05',
    dueDate: '2026-07-05',
    items: [
      {
        productId: 'prod-1',
        productName: 'Ciprodac 500',
        batchNumber: 'B-CP902',
        quantity: 150,
        rate: 45.0,
        mrp: 78.0,
        gstPercent: 12,
        amount: 6750.0
      },
      {
        productId: 'prod-2',
        productName: 'Paracip 650',
        batchNumber: 'B-PC102',
        quantity: 300,
        rate: 12.0,
        mrp: 24.50,
        gstPercent: 12,
        amount: 3600.0
      }
    ],
    subTotal: 10350.0,
    gstAmount: 1242.0,
    discountAmount: 350.0,
    totalAmount: 11242.0,
    outstandingAmount: 11242.0,
    status: 'Unpaid'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-087',
    customerId: 'cust-2',
    customerName: 'MedPlus Pharmacy - Saket',
    date: '2026-06-02',
    dueDate: '2026-07-02',
    items: [
      {
        productId: 'prod-4',
        productName: 'Pantocid 40',
        batchNumber: 'B-PT011',
        quantity: 100,
        rate: 68.0,
        mrp: 115.0,
        gstPercent: 12,
        amount: 6800.0
      }
    ],
    subTotal: 6800.0,
    gstAmount: 816.0,
    discountAmount: 200.0,
    totalAmount: 7416.0,
    outstandingAmount: 0.0,
    status: 'Paid'
  }
];

const initialDoctors: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Rohan Sharma',
    specialty: 'Cardiologist',
    hospital: 'Fortis Escorts Heart Institute',
    mobile: '+91 99112 23344',
    email: 'rohan.sharma@fortis.com',
    address: 'Okhla Road',
    city: 'New Delhi',
    zone: 'North',
    category: 'A',
    visitsCount: 14,
    lastVisitDate: '2026-06-08',
    prescribingMolecules: ['Atorvastatin', 'Aspirin', 'Ramipril']
  },
  {
    id: 'doc-2',
    name: 'Dr. Ananya Goel',
    specialty: 'Pediatrician',
    hospital: 'Max Super Speciality Hospital',
    mobile: '+91 99223 34455',
    email: 'ananya.goel@maxhealthcare.com',
    address: 'Saket',
    city: 'New Delhi',
    zone: 'North',
    category: 'A',
    visitsCount: 8,
    lastVisitDate: '2026-06-09',
    prescribingMolecules: ['Paracetamol', 'Amoxicillin + Clavulanic Acid']
  },
  {
    id: 'doc-3',
    name: 'Dr. Amit Verma',
    specialty: 'General Physician',
    hospital: 'Veritas Family Clinic',
    mobile: '+91 99334 45566',
    email: 'amit@veritasclinic.in',
    address: 'Dwarka Sector 12',
    city: 'Delhi',
    zone: 'West',
    category: 'B',
    visitsCount: 22,
    lastVisitDate: '2026-06-04',
    prescribingMolecules: ['Ciprofloxacin', 'Pantoprazole']
  },
  {
    id: 'doc-4',
    name: 'Dr. Preeti Nair',
    specialty: 'Diabetologist',
    hospital: 'Medanta - The Medicity',
    mobile: '+91 99445 56677',
    email: 'preeti.nair@medanta.org',
    address: 'Sector 38',
    city: 'Gurugram',
    zone: 'North',
    category: 'A',
    visitsCount: 19,
    lastVisitDate: '2026-06-10',
    prescribingMolecules: ['Metformin + Glimepiride', 'Teneligliptin']
  },
  {
    id: 'doc-5',
    name: 'Dr. Rajesh Kulkarni',
    specialty: 'Orthopedic',
    hospital: 'KEM Hospital & Research Centre',
    mobile: '+91 98220 12345',
    email: 'rajesh.ortho@kem.edu',
    address: 'Parel',
    city: 'Mumbai',
    zone: 'West',
    category: 'C',
    visitsCount: 5,
    lastVisitDate: '2026-05-28',
    prescribingMolecules: ['Aceclofenac', 'Methylcobalamin']
  }
];

const initialVisits: VisitRecord[] = [
  {
    id: 'visit-1',
    doctorId: 'doc-1',
    doctorName: 'Dr. Rohan Sharma',
    mrId: 'mr-1',
    mrName: 'Rahul Kapoor',
    date: '2026-06-08',
    type: 'Product Launch',
    samplesDistributed: [
      { productName: 'Atorva 10', quantity: 10 }
    ],
    giftsGiven: [
      { giftName: 'Medical Journal Diary', quantity: 1 }
    ],
    feedback: 'Doctor is highly receptive. Suggested detailing the trial findings of Atorva 10 in next visit.',
    nextFollowUpDate: '2026-06-25'
  },
  {
    id: 'visit-2',
    doctorId: 'doc-2',
    doctorName: 'Dr. Ananya Goel',
    mrId: 'mr-1',
    mrName: 'Rahul Kapoor',
    date: '2026-06-09',
    type: 'Routine',
    samplesDistributed: [
      { productName: 'Augmentin 625 DUO', quantity: 5 }
    ],
    giftsGiven: [
      { giftName: 'Desktop Pen Stand', quantity: 1 }
    ],
    feedback: 'Prescribes Augmentin regular. Prefers the dry syrup variant for younger kids. Requested samples of dry syrup.',
    nextFollowUpDate: '2026-06-22'
  }
];

const initialMRReports: MRReport[] = [
  {
    id: 'mrr-1',
    mrId: 'mr-1',
    mrName: 'Rahul Kapoor',
    date: '2026-06-11',
    activityType: 'Field Call',
    doctorsVisited: ['Dr. Rohan Sharma', 'Dr. Ananya Goel'],
    chemistVisitsCount: 5,
    retailOrderValue: 18450.0,
    expenses: [
      { type: 'Travel', amount: 350, remarks: 'Metro & Auto fare' },
      { type: 'Food', amount: 150, remarks: 'Lunch' }
    ],
    totalExpense: 500,
    tourPlanName: 'TP-2026-06-North',
    status: 'Pending Approval'
  },
  {
    id: 'mrr-2',
    mrId: 'mr-2',
    mrName: 'Sneha Sen',
    date: '2026-06-10',
    activityType: 'Field Call',
    doctorsVisited: ['Dr. Preeti Nair'],
    chemistVisitsCount: 8,
    retailOrderValue: 24200.0,
    expenses: [
      { type: 'Travel', amount: 800, remarks: 'Outstation cab fare' },
      { type: 'Food', amount: 250, remarks: 'Outstation meals' }
    ],
    totalExpense: 1050,
    tourPlanName: 'TP-2026-06-South',
    status: 'Approved',
    approvedBy: 'Sales Manager'
  }
];

const initialTourPlans: MRTourPlan[] = [
  {
    id: 'tp-1',
    mrId: 'mr-1',
    mrName: 'Rahul Kapoor',
    month: 'June 2026',
    targetCalls: 40,
    targetSales: 150000,
    routes: [
      { date: '2026-06-11', town: 'Okhla & Saket', workType: 'Doctor Call & Chemist Booking' },
      { date: '2026-06-12', town: 'Dwarka Sector 10-14', workType: 'Chemist Booking & POB' },
      { date: '2026-06-15', town: 'Connaught Place', workType: 'Core Doctor Detailing' }
    ],
    status: 'Approved'
  }
];

const initialGiftInventory: GiftInventoryItem[] = [
  {
    id: 'gift-1',
    giftName: 'Leather Portfolio Bag',
    description: 'Executive leather bags with company branding',
    valuePerUnit: 1200.0,
    totalStock: 50,
    allocatedQty: 30,
    distributedQty: 12,
    availableQty: 20
  },
  {
    id: 'gift-2',
    giftName: 'Electronic BP Monitor',
    description: 'Digital blood pressure checkers for clinic tables',
    valuePerUnit: 850.0,
    totalStock: 100,
    allocatedQty: 60,
    distributedQty: 45,
    availableQty: 40
  },
  {
    id: 'gift-3',
    giftName: 'Desktop Pen Stand',
    description: 'Stylized calendar pen stand for doctor writing desk',
    valuePerUnit: 150.0,
    totalStock: 500,
    allocatedQty: 300,
    distributedQty: 180,
    availableQty: 200
  }
];

const initialGiftAllocations: GiftAllocation[] = [
  {
    id: 'gfall-1',
    giftId: 'gift-2',
    giftName: 'Electronic BP Monitor',
    mrId: 'mr-1',
    mrName: 'Rahul Kapoor',
    allocatedQty: 10,
    distributedQty: 4,
    dateAllocated: '2026-06-01'
  },
  {
    id: 'gfall-2',
    giftId: 'gift-3',
    giftName: 'Desktop Pen Stand',
    mrId: 'mr-1',
    mrName: 'Rahul Kapoor',
    allocatedQty: 50,
    distributedQty: 25,
    dateAllocated: '2026-06-01'
  }
];

const initialLedger: LedgerEntry[] = [
  {
    id: 'led-1',
    date: '2026-06-01',
    accountName: 'Sales Income A/c',
    type: 'Credit',
    amount: 15200.0,
    balance: 152000.0,
    referenceType: 'Invoice',
    referenceNumber: 'INV-2026-081',
    remarks: 'Credit sales for May ending'
  },
  {
    id: 'led-2',
    date: '2026-06-02',
    accountName: 'MedPlus Saket Receivable',
    type: 'Debit',
    amount: 7416.0,
    balance: 7416.0,
    referenceType: 'Invoice',
    referenceNumber: 'INV-2026-087',
    remarks: 'Invoice generation'
  },
  {
    id: 'led-3',
    date: '2026-06-03',
    accountName: 'HDFC Bank A/c',
    type: 'Debit',
    amount: 7416.0,
    balance: 489000.0,
    referenceType: 'Payment',
    referenceNumber: 'TXN-9021831',
    remarks: 'Receipt from MedPlus against INV-087'
  },
  {
    id: 'led-4',
    date: '2026-06-05',
    accountName: 'Cipla Distributors Payable',
    type: 'Credit',
    amount: 12450.0,
    balance: 12450.0,
    referenceType: 'GRN',
    referenceNumber: 'GRN-2026-003',
    remarks: 'Supplier liability recorded'
  }
];

const initialNotifications: Notification[] = [
  {
    id: 'nt-1',
    type: 'warning',
    title: 'Expiry Warning - Ciprodac 500',
    message: 'Batch B-CP903 (800 units) is expiring on 2026-07-20. Only 40 days left!',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: 'nt-2',
    type: 'error',
    title: 'Expired Stock Alert',
    message: 'Batch B-PC101 (2500 units) of Paracip 650 has expired. Move to quarantine!',
    timestamp: '5 hours ago',
    read: false
  },
  {
    id: 'nt-3',
    type: 'info',
    title: 'MR Report Submitted',
    message: 'Rahul Kapoor submitted Daily Visit Report for 11th June. Pending approval.',
    timestamp: '10 minutes ago',
    read: false
  },
  {
    id: 'nt-4',
    type: 'success',
    title: 'Payment Received',
    message: '$7,416 credited from MedPlus Saket for invoice INV-2026-087.',
    timestamp: '1 day ago',
    read: true
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-06-11T22:00:00Z',
    userId: 'usr-101',
    userName: 'Dr. Vikram Mehra',
    role: 'Super Admin',
    action: 'User Login',
    details: 'Successful login on macOS / Chrome',
    ipAddress: '192.168.1.15'
  },
  {
    id: 'aud-2',
    timestamp: '2026-06-11T18:45:00Z',
    userId: 'usr-101',
    userName: 'Dr. Vikram Mehra',
    role: 'Super Admin',
    action: 'API Key Generated',
    details: 'Created API key "Integrations - Shopify Pharmacy Store"',
    ipAddress: '192.168.1.15'
  }
];

export const useStore = create<AppState>((set, get) => ({
  // Authentication & Session
  currentUser: initialUser,
  activeRole: 'Super Admin',
  sessions: initialSessions,
  apiKeys: initialApiKeys,
  notifications: initialNotifications,
  auditLogs: initialAuditLogs,
  
  // Data lists
  products: initialProducts,
  batches: initialBatches,
  inventoryTransactions: initialTransactions,
  suppliers: initialSuppliers,
  customers: initialCustomers,
  purchaseOrders: [],
  grns: [],
  salesInvoices: initialSalesInvoices,
  doctors: initialDoctors,
  visitRecords: initialVisits,
  mrReports: initialMRReports,
  mrTourPlans: initialTourPlans,
  giftInventory: initialGiftInventory,
  giftAllocations: initialGiftAllocations,
  ledger: initialLedger,

  // Authentication actions
  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      set({ activeRole: user.role });
    }
  },
  
  setActiveRole: (role) => {
    set({ activeRole: role });
    get().logActivity('Role Changed', `Switched active dashboard session view role to ${role}`);
  },

  enable2FA: (secret) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, is2FAEnabled: true, twoFactorSecret: secret } : null
    }));
    get().logActivity('2FA Enabled', 'Two-factor authentication successfully configured');
    get().addNotification('success', '2FA Enabled', 'Two-factor authentication has been enabled on your account.');
  },

  disable2FA: () => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, is2FAEnabled: false, twoFactorSecret: undefined } : null
    }));
    get().logActivity('2FA Disabled', 'Two-factor authentication disabled');
    get().addNotification('warning', '2FA Disabled', 'Two-factor authentication has been disabled.');
  },

  // Notification actions
  addNotification: (type, title, message) => {
    const newNotif: Notification = {
      id: `nt-${Date.now()}`,
      type,
      title,
      message,
      timestamp: 'Just now',
      read: false
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications]
    }));
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    }));
  },

  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    }));
  },

  // Audit actions
  logActivity: (action, details) => {
    const user = get().currentUser;
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest User',
      role: get().activeRole,
      action,
      details,
      ipAddress: '192.168.1.15' // Mocked IP
    };
    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs]
    }));
  },

  // Api keys
  generateApiKey: (name) => {
    const prefix = `mep_live_${Math.random().toString(36).substring(2, 8)}${Math.random().toString(36).substring(2, 8)}...`;
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      keyPrefix: prefix,
      createdDate: new Date().toISOString(),
      status: 'Active'
    };
    set((state) => ({
      apiKeys: [newKey, ...state.apiKeys]
    }));
    get().logActivity('API Key Generated', `Created API key: "${name}"`);
    get().addNotification('success', 'API Key Created', `API key "${name}" was generated successfully.`);
  },

  revokeApiKey: (id) => {
    const key = get().apiKeys.find((k) => k.id === id);
    set((state) => ({
      apiKeys: state.apiKeys.map((k) => (k.id === id ? { ...k, status: 'Revoked' as const } : k))
    }));
    if (key) {
      get().logActivity('API Key Revoked', `Revoked API key: "${key.name}"`);
      get().addNotification('warning', 'API Key Revoked', `API key "${key.name}" was revoked.`);
    }
  },

  // Product Actions
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      stockLevel: 0
    };
    set((state) => ({
      products: [...state.products, newProduct]
    }));
    get().logActivity('Product Created', `Added new product: ${product.brandName} (${product.genericName})`);
    get().addNotification('success', 'Product Added', `Product "${product.brandName}" created.`);
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));
    const p = get().products.find((prod) => prod.id === id);
    if (p) {
      get().logActivity('Product Updated', `Updated product: ${p.brandName}`);
    }
  },

  deleteProduct: (id) => {
    const p = get().products.find((prod) => prod.id === id);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id)
    }));
    if (p) {
      get().logActivity('Product Deleted', `Deleted product: ${p.brandName}`);
      get().addNotification('warning', 'Product Removed', `Product "${p.brandName}" was deleted.`);
    }
  },

  // Batch Actions
  addBatch: (batch) => {
    const newBatch: Batch = {
      ...batch,
      id: `bat-${Date.now()}`
    };
    set((state) => ({
      batches: [...state.batches, newBatch]
    }));
    // Adjust product stock level
    set((state) => ({
      products: state.products.map((p) =>
        p.id === batch.productId
          ? { ...p, stockLevel: p.stockLevel + batch.quantity }
          : p
      )
    }));
    get().logActivity('Batch Created', `Added batch ${batch.batchNumber} for ${batch.brandName}`);
    get().addNotification('success', 'Batch Added', `Batch ${batch.batchNumber} for "${batch.brandName}" created successfully.`);
  },

  updateBatch: (id, updates) => {
    const oldBatch = get().batches.find((b) => b.id === id);
    set((state) => ({
      batches: state.batches.map((b) => (b.id === id ? { ...b, ...updates } : b))
    }));
    
    // If quantity was updated, adjust product stock
    if (oldBatch && updates.availableQuantity !== undefined) {
      const diff = updates.availableQuantity - oldBatch.availableQuantity;
      if (diff !== 0) {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === oldBatch.productId
              ? { ...p, stockLevel: p.stockLevel + diff }
              : p
          )
        }));
      }
    }
    const b = get().batches.find((batch) => batch.id === id);
    if (b) {
      get().logActivity('Batch Updated', `Updated batch details for ${b.batchNumber}`);
    }
  },

  // Inventory transaction logger
  addInventoryTransaction: (tx) => {
    const newTx: InventoryTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      performedBy: get().currentUser?.name || 'System'
    };
    set((state) => ({
      inventoryTransactions: [newTx, ...state.inventoryTransactions]
    }));

    // Adjust corresponding batch quantity
    const batch = get().batches.find(
      (b) => b.productId === tx.productId && b.batchNumber === tx.batchNumber
    );

    if (batch) {
      const isOut = tx.type === 'Stock Out' || tx.type === 'Stock Transfer' && !tx.targetWarehouse;
      const isIn = tx.type === 'Stock In';
      const isTransfer = tx.type === 'Stock Transfer' && tx.sourceWarehouse && tx.targetWarehouse;
      const isAdjustment = tx.type === 'Stock Adjustment';
      
      let qtyDiff = 0;
      if (isIn) qtyDiff = tx.quantity;
      if (isOut) qtyDiff = -tx.quantity;
      if (isAdjustment) qtyDiff = tx.quantity; // adjustment can be +ve or -ve

      if (qtyDiff !== 0) {
        get().updateBatch(batch.id, {
          availableQuantity: Math.max(0, batch.availableQuantity + qtyDiff)
        });
      }
    }
    get().logActivity('Inventory Logged', `${tx.type} recorded for ${tx.productName} (Qty: ${tx.quantity})`);
  },

  // Suppliers & Customers
  addSupplier: (supplier) => {
    const newSupp: Supplier = {
      ...supplier,
      id: `supp-${Date.now()}`,
      outstandingAmount: 0
    };
    set((state) => ({
      suppliers: [...state.suppliers, newSupp]
    }));
    get().logActivity('Supplier Added', `Added supplier: ${supplier.name}`);
  },

  updateSupplier: (id, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s))
    }));
  },

  addCustomer: (customer) => {
    const newCust: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
      outstandingAmount: 0
    };
    set((state) => ({
      customers: [...state.customers, newCust]
    }));
    get().logActivity('Customer Added', `Added customer store: ${customer.name}`);
  },

  updateCustomer: (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c))
    }));
  },

  // Invoicing & Orders
  createPurchaseOrder: (po) => {
    const newPO: PurchaseOrder = {
      ...po,
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-00${get().purchaseOrders.length + 5}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent'
    };
    set((state) => ({
      purchaseOrders: [newPO, ...state.purchaseOrders]
    }));
    get().logActivity('Purchase Order Created', `Created ${newPO.poNumber} for ${po.supplierName}`);
    get().addNotification('success', 'Purchase Order Sent', `${newPO.poNumber} was sent to ${po.supplierName}.`);
  },

  receiveGRN: (grn) => {
    const newGRN: GRN = {
      ...grn,
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-2026-00${get().grns.length + 5}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Completed'
    };
    set((state) => ({
      grns: [newGRN, ...state.grns]
    }));

    // For each item in GRN, we add a batch if it doesn't exist, and update stock
    grn.items.forEach((item) => {
      const product = get().products.find((p) => p.id === item.productId);
      if (product) {
        // Add new batch
        get().addBatch({
          productId: item.productId,
          productName: item.productName,
          brandName: product.brandName,
          batchNumber: item.batchNumber,
          quantity: item.acceptedQty,
          manufacturingDate: new Date().toISOString().split('T')[0], // Mocked
          expiryDate: item.expiryDate,
          tradeRate: product.tradeRate,
          mrp: product.mrp,
          availableQuantity: item.acceptedQty,
          status: 'Normal'
        });

        // Add inventory transaction
        get().addInventoryTransaction({
          type: 'Stock In',
          productId: item.productId,
          productName: item.productName,
          batchNumber: item.batchNumber,
          quantity: item.acceptedQty,
          targetWarehouse: 'Warehouse Alpha (Main)',
          referenceNumber: newGRN.grnNumber,
          remarks: `Received via ${newGRN.grnNumber}`
        });
      }
    });

    get().logActivity('GRN Processed', `Goods Receipt Note ${newGRN.grnNumber} processed`);
    get().addNotification('success', 'GRN Processed', `Stock updated for ${newGRN.grnNumber}.`);
  },

  createSalesInvoice: (invoice) => {
    const newInv: SalesInvoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-0${get().salesInvoices.length + 89}`,
      date: new Date().toISOString().split('T')[0],
      outstandingAmount: invoice.totalAmount,
      status: 'Unpaid'
    };

    set((state) => ({
      salesInvoices: [newInv, ...state.salesInvoices]
    }));

    // Deduct stock and log transaction
    invoice.items.forEach((item) => {
      get().addInventoryTransaction({
        type: 'Stock Out',
        productId: item.productId,
        productName: item.productName,
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        sourceWarehouse: 'Warehouse Alpha (Main)',
        referenceNumber: newInv.invoiceNumber,
        remarks: `Sales billing to ${newInv.customerName}`
      });
    });

    // Update customer outstanding
    const customer = get().customers.find((c) => c.id === invoice.customerId);
    if (customer) {
      get().updateCustomer(invoice.customerId, {
        outstandingAmount: customer.outstandingAmount + invoice.totalAmount
      });
    }

    // Add ledger entry
    const entry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: newInv.date,
      accountName: `${newInv.customerName} A/c`,
      type: 'Debit',
      amount: newInv.totalAmount,
      balance: (get().ledger[get().ledger.length - 1]?.balance || 489000.0) + newInv.totalAmount,
      referenceType: 'Invoice',
      referenceNumber: newInv.invoiceNumber,
      remarks: `Sales invoicing recorded`
    };

    set((state) => ({
      ledger: [...state.ledger, entry]
    }));

    get().logActivity('Invoice Created', `Generated ${newInv.invoiceNumber} for ${invoice.customerName}`);
    get().addNotification('success', 'Invoice Generated', `Invoice ${newInv.invoiceNumber} ($${newInv.totalAmount.toFixed(2)}) generated successfully.`);
  },

  payInvoice: (invoiceId, amount) => {
    const invoice = get().salesInvoices.find((i) => i.id === invoiceId);
    if (!invoice) return;

    const newOutstanding = Math.max(0, invoice.outstandingAmount - amount);
    const isPaid = newOutstanding === 0;

    set((state) => ({
      salesInvoices: state.salesInvoices.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              outstandingAmount: newOutstanding,
              status: isPaid ? 'Paid' : 'Partially Paid'
            }
          : i
      )
    }));

    // Update customer outstanding
    const customer = get().customers.find((c) => c.id === invoice.customerId);
    if (customer) {
      get().updateCustomer(invoice.customerId, {
        outstandingAmount: Math.max(0, customer.outstandingAmount - amount)
      });
    }

    // Add ledger entry
    const entry: LedgerEntry = {
      id: `led-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      accountName: 'HDFC Bank A/c',
      type: 'Debit',
      amount: amount,
      balance: (get().ledger[get().ledger.length - 1]?.balance || 489000.0) + amount,
      referenceType: 'Payment',
      referenceNumber: `REC-${Date.now().toString().substring(8)}`,
      remarks: `Payment received against ${invoice.invoiceNumber}`
    };

    set((state) => ({
      ledger: [...state.ledger, entry]
    }));

    get().logActivity('Invoice Paid', `Received payment of $${amount} against ${invoice.invoiceNumber}`);
    get().addNotification('success', 'Payment Received', `Recorded payment of $${amount} for ${invoice.invoiceNumber}.`);
  },

  // Doctor CRM
  addDoctor: (doctor) => {
    const newDoc: Doctor = {
      ...doctor,
      id: `doc-${Date.now()}`,
      visitsCount: 0,
      prescribingMolecules: []
    };
    set((state) => ({
      doctors: [...state.doctors, newDoc]
    }));
    get().logActivity('Doctor Added', `Added doctor: ${doctor.name} (${doctor.specialty})`);
  },

  updateDoctor: (id, updates) => {
    set((state) => ({
      doctors: state.doctors.map((d) => (d.id === id ? { ...d, ...updates } : d))
    }));
  },

  logDoctorVisit: (visit) => {
    const newVisit: VisitRecord = {
      ...visit,
      id: `visit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mrId: 'mr-1', // Mocked active MR
      mrName: 'Rahul Kapoor'
    };

    set((state) => ({
      visitRecords: [newVisit, ...state.visitRecords]
    }));

    // Update Doctor visit counts and last visit date
    const doctor = get().doctors.find((d) => d.id === visit.doctorId);
    if (doctor) {
      const uniqueMols = Array.from(new Set([...doctor.prescribingMolecules, ...visit.samplesDistributed.map(s => s.productName)]));
      get().updateDoctor(doctor.id, {
        visitsCount: doctor.visitsCount + 1,
        lastVisitDate: newVisit.date,
        prescribingMolecules: uniqueMols
      });
    }

    // Reduce sample quantities from allocated gifts
    visit.giftsGiven.forEach((gift) => {
      set((state) => ({
        giftAllocations: state.giftAllocations.map((a) =>
          a.mrId === 'mr-1' && a.giftName === gift.giftName
            ? { ...a, distributedQty: a.distributedQty + gift.quantity }
            : a
        ),
        giftInventory: state.giftInventory.map((g) =>
          g.giftName === gift.giftName
            ? { ...g, distributedQty: g.distributedQty + gift.quantity }
            : g
        )
      }));
    });

    get().logActivity('Doctor Visit Logged', `Logged MR call to ${visit.doctorName}`);
    get().addNotification('success', 'Doctor Call Logged', `Logged call report for ${visit.doctorName}.`);
  },

  // MR Report approvals
  submitMRReport: (report) => {
    const newReport: MRReport = {
      ...report,
      id: `mrr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mrId: 'mr-1',
      mrName: 'Rahul Kapoor',
      status: 'Pending Approval'
    };
    set((state) => ({
      mrReports: [newReport, ...state.mrReports]
    }));
    get().logActivity('MR Report Submitted', `Submitted daily call report for ${newReport.date}`);
    get().addNotification('info', 'New MR Report', `MR Rahul Kapoor submitted call report for ${newReport.date}.`);
  },

  approveMRReport: (id) => {
    set((state) => ({
      mrReports: state.mrReports.map((r) =>
        r.id === id ? { ...r, status: 'Approved', approvedBy: get().currentUser?.name || 'Manager' } : r
      )
    }));
    const report = get().mrReports.find((r) => r.id === id);
    if (report) {
      // Add expenses to accounting ledger
      const entry: LedgerEntry = {
        id: `led-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        accountName: 'MR Business Expenses A/c',
        type: 'Credit',
        amount: report.totalExpense,
        balance: (get().ledger[get().ledger.length - 1]?.balance || 489000.0) - report.totalExpense,
        referenceType: 'Journal',
        referenceNumber: `EXP-${report.id.substring(4, 8)}`,
        remarks: `Reimbursement for ${report.mrName} calls on ${report.date}`
      };
      set((state) => ({
        ledger: [...state.ledger, entry]
      }));

      get().logActivity('MR Report Approved', `Approved expenses and reports for ${report.mrName}`);
      get().addNotification('success', 'MR Report Approved', `${report.mrName}'s visit report has been approved.`);
    }
  },

  rejectMRReport: (id) => {
    set((state) => ({
      mrReports: state.mrReports.map((r) =>
        r.id === id ? { ...r, status: 'Rejected' } : r
      )
    }));
    const report = get().mrReports.find((r) => r.id === id);
    if (report) {
      get().logActivity('MR Report Rejected', `Rejected visit report for ${report.mrName}`);
      get().addNotification('warning', 'MR Report Rejected', `${report.mrName}'s visit report was rejected.`);
    }
  },

  submitTourPlan: (plan) => {
    const newPlan: MRTourPlan = {
      ...plan,
      id: `tp-${Date.now()}`,
      mrId: 'mr-1',
      mrName: 'Rahul Kapoor',
      status: 'Submitted'
    };
    set((state) => ({
      mrTourPlans: [newPlan, ...state.mrTourPlans]
    }));
    get().logActivity('MR Tour Plan Submitted', `Submitted Tour Plan for ${plan.month}`);
    get().addNotification('info', 'New Tour Plan', `MR Rahul Kapoor submitted Tour Plan for ${plan.month}.`);
  },

  approveTourPlan: (id) => {
    set((state) => ({
      mrTourPlans: state.mrTourPlans.map((p) =>
        p.id === id ? { ...p, status: 'Approved' } : p
      )
    }));
    const plan = get().mrTourPlans.find((p) => p.id === id);
    if (plan) {
      get().logActivity('MR Tour Plan Approved', `Approved Tour Plan for ${plan.mrName} for ${plan.month}`);
      get().addNotification('success', 'Tour Plan Approved', `Approved ${plan.mrName}'s tour plan for ${plan.month}.`);
    }
  },

  rejectTourPlan: (id) => {
    set((state) => ({
      mrTourPlans: state.mrTourPlans.map((p) =>
        p.id === id ? { ...p, status: 'Rejected' } : p
      )
    }));
    const plan = get().mrTourPlans.find((p) => p.id === id);
    if (plan) {
      get().logActivity('MR Tour Plan Rejected', `Rejected Tour Plan for ${plan.mrName} for ${plan.month}`);
      get().addNotification('warning', 'Tour Plan Rejected', `Rejected ${plan.mrName}'s tour plan for ${plan.month}.`);
    }
  },

  // Gift allocations
  allocateGift: (allocation) => {
    const newAlloc: GiftAllocation = {
      ...allocation,
      id: `gfall-${Date.now()}`,
      dateAllocated: new Date().toISOString().split('T')[0],
      distributedQty: 0
    };
    set((state) => ({
      giftAllocations: [...state.giftAllocations, newAlloc],
      giftInventory: state.giftInventory.map((g) =>
        g.id === allocation.giftId
          ? {
              ...g,
              allocatedQty: g.allocatedQty + allocation.allocatedQty,
              availableQty: g.availableQty - allocation.allocatedQty
            }
          : g
      )
    }));
    get().logActivity('Gift Allocated', `Allocated ${allocation.allocatedQty} of ${allocation.giftName} to MR ${allocation.mrName}`);
    get().addNotification('success', 'Gifts Allocated', `Allocated ${allocation.allocatedQty} units of ${allocation.giftName}.`);
  },

  postLedgerEntry: (entry) => {
    const lastBalance = get().ledger[get().ledger.length - 1]?.balance || 489000.0;
    const newBalance = entry.type === 'Debit' ? lastBalance + entry.amount : lastBalance - entry.amount;
    const newEntry: LedgerEntry = {
      ...entry,
      id: `led-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      balance: newBalance
    };
    set((state) => ({
      ledger: [...state.ledger, newEntry]
    }));
    get().logActivity('Journal Posted', `Journal entry posted to ${entry.accountName} - $${entry.amount.toFixed(2)}`);
    get().addNotification('success', 'Journal Entry Posted', `Successfully posted entry to ${entry.accountName}.`);
  }
}));
export default useStore;

