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
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  settings: BusinessSettings;
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

// Referral Types
export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  businessId: string;
  status: 'pending' | 'completed' | 'expired';
  rewardAmount: number;
  createdAt: Date;
  completedAt?: Date;
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
