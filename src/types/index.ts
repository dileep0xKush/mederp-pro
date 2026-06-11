export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Purchase Manager'
  | 'Sales Manager'
  | 'Medical Representative'
  | 'Accountant'
  | 'Store Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile?: string;
  companyName?: string;
  avatarUrl?: string;
  is2FAEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
  lastLogin: string;
}

export interface SessionActivity {
  id: string;
  device: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface RolePermission {
  role: UserRole;
  permissions: {
    dashboard: 'view' | 'none';
    products: 'read' | 'write' | 'none';
    inventory: 'read' | 'write' | 'none';
    purchases: 'read' | 'write' | 'none';
    sales: 'read' | 'write' | 'none';
    crm: 'read' | 'write' | 'none';
    mrManagement: 'read' | 'write' | 'none';
    gifts: 'read' | 'write' | 'none';
    accounting: 'read' | 'write' | 'none';
    reports: 'read' | 'none';
    settings: 'all' | 'restricted' | 'none';
  };
}

export interface Product {
  id: string;
  brandName: string;
  genericName: string;
  molecule: string;
  strength: string; // e.g. "500mg"
  dosageForm: string; // e.g. "Tablet", "Capsule", "Syrup"
  packing: string; // e.g. "10x10 Tablets"
  manufacturer: string;
  supplierId: string;
  supplierName: string;
  hsnCode: string;
  gstPercent: number; // e.g. 12 or 18
  tradeRate: number;
  mrp: number;
  doctorGiftScheme: string; // e.g. "10+1 free"
  status: 'Active' | 'Inactive';
  createdAt: string;
  stockLevel: number;
}

export interface Batch {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  tradeRate: number;
  mrp: number;
  availableQuantity: number;
  status: 'Normal' | 'Near Expiry' | 'Expired' | 'Low Stock';
}

export interface InventoryTransaction {
  id: string;
  date: string;
  type: 'Stock In' | 'Stock Out' | 'Stock Transfer' | 'Stock Adjustment';
  productId: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  sourceWarehouse?: string;
  targetWarehouse?: string;
  referenceNumber: string; // GRN, Invoice No, etc.
  performedBy: string;
  remarks?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gstIn: string;
  address: string;
  city: string;
  outstandingAmount: number;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  name: string;
  type: 'Retailer' | 'Stockist' | 'Distributor';
  contactPerson: string;
  mobile: string;
  email: string;
  gstIn: string;
  address: string;
  city: string;
  outstandingAmount: number;
  creditLimit: number;
  status: 'Active' | 'Inactive';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  deliveryDate: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
}

export interface GRN {
  id: string;
  grnNumber: string;
  poNumber?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  receivedBy: string;
  items: {
    productId: string;
    productName: string;
    batchNumber: string;
    expiryDate: string;
    orderedQty: number;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty: number;
  }[];
  status: 'Pending Verification' | 'Completed';
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: {
    productId: string;
    productName: string;
    batchNumber: string;
    quantity: number;
    rate: number;
    mrp: number;
    gstPercent: number;
    amount: number;
  }[];
  subTotal: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  outstandingAmount: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overdue';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  zone: string;
  category: 'A' | 'B' | 'C'; // VIP, Regular, etc.
  visitsCount: number;
  lastVisitDate?: string;
  prescribingMolecules: string[];
}

export interface VisitRecord {
  id: string;
  doctorId: string;
  doctorName: string;
  mrId: string;
  mrName: string;
  date: string;
  type: 'Routine' | 'Product Launch' | 'Scheme Presentation';
  samplesDistributed: {
    productName: string;
    quantity: number;
  }[];
  giftsGiven: {
    giftName: string;
    quantity: number;
  }[];
  feedback: string;
  nextFollowUpDate?: string;
}

export interface MRReport {
  id: string;
  mrId: string;
  mrName: string;
  date: string;
  activityType: 'Field Call' | 'Admin Day' | 'Leave' | 'Meeting';
  doctorsVisited: string[]; // Doctor Names
  chemistVisitsCount: number;
  retailOrderValue: number;
  expenses: {
    type: 'Travel' | 'Food' | 'Postage' | 'Miscellaneous';
    amount: number;
    remarks?: string;
  }[];
  totalExpense: number;
  tourPlanName: string; // Tour plan reference
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  approvedBy?: string;
  samplesDistributed?: {
    productName: string;
    quantity: number;
  }[];
  giftsGiven?: {
    giftName: string;
    quantity: number;
  }[];
}

export interface MRTourPlan {
  id: string;
  mrId: string;
  mrName: string;
  month: string; // e.g. "June 2026"
  targetCalls: number;
  targetSales: number;
  routes: {
    date: string;
    town: string;
    workType: string;
  }[];
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

export interface GiftInventoryItem {
  id: string;
  giftName: string;
  description?: string;
  valuePerUnit: number;
  totalStock: number;
  allocatedQty: number;
  distributedQty: number;
  availableQty: number;
}

export interface GiftAllocation {
  id: string;
  giftId: string;
  giftName: string;
  mrId: string;
  mrName: string;
  allocatedQty: number;
  distributedQty: number;
  dateAllocated: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  accountName: string;
  type: 'Debit' | 'Credit';
  amount: number;
  balance: number;
  referenceType: 'Invoice' | 'GRN' | 'Payment' | 'Receipt' | 'Journal';
  referenceNumber: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdDate: string;
  expiryDate?: string;
  lastUsedDate?: string;
  status: 'Active' | 'Revoked';
}
