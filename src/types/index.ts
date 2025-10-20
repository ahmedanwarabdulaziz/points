// Unified User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'business' | 'customer';
  createdAt: Date;
  updatedAt: Date;
  
  // Customer-specific fields (only for customers)
  name?: string;
  businessId?: string; // REQUIRED for customers - which business they belong to
  classId?: string; // REQUIRED for customers - which class they belong to
  referralCode?: string;
  referredBy?: string; // ID of the customer who referred them
  points?: number;
  totalEarned?: number;
  totalRedeemed?: number;
  status?: 'active' | 'inactive' | 'suspended';
  lastActivity?: Date;
  
  // Referral system fields
  referralCount?: number; // Number of successful referrals
  referralPoints?: number; // Points earned from referrals
  referralHistory?: ReferralRecord[]; // List of referrals made
  
  // Customer code and QR system fields
  customerCode?: string; // Format: [2 letters][5 numbers] e.g., "AH12345"
  qrCodeUrl?: string; // URL containing customer code for QR scanning
  
  // Business-specific fields (only for business owners)
  businessName?: string;
  businessDescription?: string;
  businessLogo?: string;
  businessStatus?: 'pending' | 'approved' | 'rejected';
  businessApprovedAt?: Date;
  businessApprovedBy?: string;
}

// Business Types
export interface Business {
  id: string;
  name: string;
  description: string;
  logo?: string;
  ownerId: string;
  status: 'pending' | 'approved' | 'rejected';
  industryId?: string;
  typeId?: string;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  settings: BusinessSettings;
  referralSettings?: ReferralSettings; // Optional referral settings per business
}

export interface BusinessSettings {
  allowReferrals: boolean;
  defaultPointsPerDollar: number;
  maxCustomers?: number;
  customBranding?: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
  };
  // Points request system settings
  allowCustomerRequests: boolean; // Enable/disable customer points requests
  businessPrefix?: string; // 2-letter prefix for customer codes
}

// Customer Class Types
export interface CustomerClass {
  id: string;
  businessId: string;
  name: string;
  type: 'permanent' | 'custom';
  description: string;
  features: ClassFeatures;
  qrCode?: string;
  qrCodeExpiry?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // User ID who created the class
  customerCount?: number; // Number of customers in this class
  totalPointsIssued?: number; // Total points issued to this class
}

export interface ClassFeatures {
  pointsPerDollar: number;
  referralBonus: number;
  specialRewards: string[];
  restrictions: string[];
  minSpend?: number; // Minimum spend to qualify
  maxPointsPerTransaction?: number; // Maximum points per transaction
  expiryDays?: number; // Points expiry in days
}

// Referral System Types
export interface ReferralRecord {
  id: string;
  referrerId: string; // ID of the customer who made the referral
  refereeId: string; // ID of the customer who was referred
  refereeEmail: string;
  refereeName: string;
  businessId: string;
  classId: string;
  status: 'pending' | 'completed' | 'cancelled';
  referrerPoints: number; // Points awarded to referrer
  refereePoints: number; // Bonus points awarded to referee
  createdAt: Date;
  completedAt?: Date;
}

export interface ReferralSettings {
  enabled: boolean;
  referrerPoints: number; // Points for the person who refers
  refereePoints: number; // Bonus points for the person being referred
  maxReferralsPerCustomer?: number; // Optional limit
  expiryDays?: number; // How long referral links are valid
}

// Legacy Customer interface - DEPRECATED
// Use User interface with customer fields instead
export interface Customer {
  id: string;
  businessId: string;
  classId: string;
  userId: string;
  name: string;
  referralCode: string;
  referredBy?: string;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  lastActivity: Date;
}


// QR Code Types
export interface QRCodeData {
  businessId: string;
  classId: string;
  type: 'class' | 'referral';
  expiry?: Date;
  metadata?: Record<string, unknown>;
}

// Analytics Types
export interface BusinessAnalytics {
  businessId: string;
  totalCustomers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalReferrals: number;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  newCustomers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  referrals: number;
}

// Admin Types
export interface AdminDashboard {
  totalBusinesses: number;
  pendingApprovals: number;
  totalCustomers: number;
  systemStats: SystemStats;
}

export interface SystemStats {
  totalUsers: number;
  activeBusinesses: number;
  totalPointsInSystem: number;
  totalReferrals: number;
}

// Points Request System Types
export interface PointsRequest {
  id: string;
  customerId: string;
  businessId: string;
  customerName: string;
  customerCode: string;
  pointsRequested: number;
  reference: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // 3 days from creation
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface PointsTransaction {
  id: string;
  customerId: string;
  businessId: string;
  points: number;
  type: 'direct_transfer' | 'request_approved' | 'referral_points' | 'signup_points' | 'purchase_points';
  reference: string;
  note?: string;
  createdAt: Date;
  createdBy: string; // User ID who initiated the transaction
  requestId?: string; // If this was from a points request
}

export interface BusinessPrefix {
  businessId: string;
  prefix: string; // 2-letter prefix
  createdAt: Date;
}
