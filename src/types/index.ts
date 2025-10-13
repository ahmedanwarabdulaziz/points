/**
 * TypeScript Type Definitions for Points Redeem System
 * Based on database schema from project plan
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER ROLES
// ============================================================================

export type UserRole = 'customer' | 'business_owner' | 'business_staff' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  businessId?: string;
  customerId?: string; // Short customer ID (e.g., AB1234) for easy lookup
  qrCodeId?: string; // Long QR code ID for scanning
  mustChangePassword?: boolean; // For first-time login password change
  createdAt: Timestamp;
  lastActive: Timestamp;
}

// ============================================================================
// BUSINESS
// ============================================================================

export interface Business {
  id: string;
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  categoryId: string;
  subCategoryId: string;
  category?: string; // Deprecated, use categoryId
  ownerId: string;
  ownerEmail: string;
  ownerName?: string;
  createdAt: Timestamp;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'rejected';
  connectedBusinesses: string[];
}

export interface BusinessSettings {
  pointsEarningRate: number;           // e.g., 1 point per $1
  homeRedemptionRate: number;          // e.g., 10 points = $1 at home
  externalRedemptionRate: number;      // e.g., 20 points = $1 at other businesses
  pointsExpirationMonths: number;      // e.g., 12 months
  transactionApprovalThreshold: number; // e.g., $500
  maxTransactionPerStaffDaily: number; // e.g., 10000 points
}

// ============================================================================
// CUSTOMER GROUPS / TAGS
// ============================================================================

export interface CustomerGroup {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  badgeIcon: string;
  qrCodeId: string;
  invitationCode: string;
  visibility: 'public' | 'hidden' | 'invite_only';
  autoJoinCriteria?: {
    spendThreshold?: number;
    transactionCount?: number;
  };
  memberCount: number;
  active: boolean;
  benefits: GroupBenefits;
  analytics: GroupAnalytics;
}

export interface GroupBenefits {
  earningMultiplier: number;          // e.g., 2.0 for 2x points
  redemptionBonusPercent: number;     // e.g., 10 for 10% bonus
  welcomeBonusPoints: number;         // e.g., 500 points
  exclusiveRewards: boolean;
  timeBasedMultiplier?: {
    days: string[];                   // ['monday', 'friday']
    hours: { start: number; end: number };
    multiplier: number;
  };
  referralBonus: {
    referrer: number;
    referee: number;
  };
}

export interface GroupAnalytics {
  totalMembers: number;
  activeMembers: number;
  totalPointsIssued: number;
  totalRedemptions: number;
  avgLifetimeValue: number;
}

// ============================================================================
// FLASH OFFERS
// ============================================================================

export interface FlashOffer {
  id: string;
  businessId: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetGroups: string[];             // Group IDs
  offerType: 'multiplier' | 'bonus_points' | 'discount' | 'free_item';
  offerValue: number;
  startTime: Timestamp;
  endTime: Timestamp;
  maxRedemptions: number;
  maxPerCustomer: number;
  currentRedemptions: number;
  status: 'scheduled' | 'active' | 'expired' | 'stopped';
  createdBy: string;
  pushSent: boolean;
}

// ============================================================================
// CUSTOMER
// ============================================================================

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  qrCodeId: string;                   // Unique QR for staff scanning
  registeredVia: string;              // Business ID of first registration
  createdAt: Timestamp;
  lastActive: Timestamp;
  pushToken?: string;
  totalReferrals: number;
}

export interface CustomerWallet {
  businessId: string;
  pointsBalance: number;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
  lifetimeSpend: number;
  tier?: string;
  joinedAt: Timestamp;
  lastTransaction: Timestamp;
}

export interface CustomerTag {
  groupId: string;
  taggedAt: Timestamp;
  taggedVia: 'qr_scan' | 'referral' | 'auto' | 'manual';
  referredByCustomerId?: string;
  active: boolean;
  expiresAt?: Timestamp;
}

export interface CustomerReferral {
  businessId: string;
  totalReferred: number;
  activeReferred: number;
  totalReferralPointsEarned: number;
  milestoneTier: string;
  referredCustomers: ReferredCustomer[];
}

export interface ReferredCustomer {
  customerId: string;
  referredAt: Timestamp;
  firstPurchaseAt?: Timestamp;
  status: 'pending' | 'active' | 'rewarded';
  referrerRewardPoints: number;
  refereeRewardPoints: number;
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

export interface Transaction {
  id: string;
  customerId: string;
  businessId: string;
  type: 'earn' | 'redeem' | 'bonus' | 'referral' | 'adjustment';
  points: number;
  amountSpent?: number;
  basePoints?: number;
  multiplierApplied?: number;
  appliedGroup?: string;
  flashOfferId?: string;
  staffId?: string;
  status: 'completed' | 'pending_approval' | 'rejected';
  timestamp: Timestamp;
  approvalNotes?: string;
  approvedBy?: string;
}

// ============================================================================
// REWARDS
// ============================================================================

export interface Reward {
  id: string;
  businessId: string;
  title: string;
  description: string;
  imageUrl?: string;
  pointsRequired: number;
  category: 'food' | 'discount' | 'service' | 'item' | 'other';
  exclusiveToGroups?: string[];       // null = available to all
  availableQuantity?: number;
  redemptionLimitPerCustomer?: number;
  active: boolean;
  validUntil?: Timestamp;
}

export interface Redemption {
  id: string;
  customerId: string;
  businessId: string;
  rewardId: string;
  pointsUsed: number;
  redemptionCode: string;             // Show to staff
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  createdAt: Timestamp;
  redeemedAt?: Timestamp;
  validatedByStaffId?: string;
  expiresAt: Timestamp;
}

// ============================================================================
// STAFF
// ============================================================================

export interface BusinessStaff {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  permissions: StaffPermissions;
  dailyPointsIssued: number;
  lastResetDate: Timestamp;
  active: boolean;
}

export interface StaffPermissions {
  canGivePoints: boolean;
  canCreateOffers: boolean;
  canManageRewards: boolean;
  canViewAnalytics: boolean;
  canManageStaff: boolean;
}

// ============================================================================
// INVITATION CODES
// ============================================================================

export interface InvitationCode {
  id: string;
  type: 'business_qr' | 'customer_referral' | 'business_promo';
  businessId: string;
  code: string;
  autoAssignGroup?: string;
  createdBy: string;
  referrerCustomerId?: string;
  active: boolean;
  uses: number;
  maxUses?: number;
  expiresAt?: Timestamp;
}

// ============================================================================
// SUPER ADMIN
// ============================================================================

export interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin';
  permissions: string[];
  lastLogin: Timestamp;
}

export interface ApprovalQueueItem {
  transactionId: string;
  businessId: string;
  customerId: string;
  staffId: string;
  amount: number;
  points: number;
  reason: string;
  submittedAt: Timestamp;
  priority: 'low' | 'medium' | 'high';
  status: 'pending';
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  CustomerApp: undefined;
  BusinessApp: undefined;
  AdminApp: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: { inviteCode?: string; businessId?: string; profileId?: string };
  RegisterBusiness: undefined;
  ScanQR: undefined;
};

export type CustomerStackParamList = {
  Home: undefined;
  MyQRCode: undefined;
  Rewards: undefined;
  History: undefined;
  Profile: undefined;
  BusinessDetail: { businessId: string };
  RewardDetail: { rewardId: string };
  Referral: undefined;
};

export type BusinessStackParamList = {
  Dashboard: undefined;
  ScanCustomer: undefined;
  SendPoints: undefined;
  TransactionForm: { customerId: string; customerName: string; customerEmail: string; profileId?: string };
  Transactions: undefined;
  Rewards: undefined;
  Customers: undefined;
  Profiles: undefined;
  CreateProfile: undefined;
  EditProfile: { profileId: string };
  Settings: undefined;
  CreateFlashOffer: undefined;
  CreateTag: undefined;
};

export type AdminStackParamList = {
  Overview: undefined;
  Businesses: undefined;
  Customers: undefined;
  Connections: undefined;
  Approvals: undefined;
  Analytics: undefined;
  Settings: undefined;
  AddBusiness: undefined;
  EditBusiness: { businessId: string };
  Categories: undefined;
  AddCategory: undefined;
  EditCategory: { categoryId: string };
  SubCategories: { categoryId: string };
  AddSubCategory: { categoryId: string };
  EditSubCategory: { categoryId: string; subCategoryId: string };
};

// ============================================================================
// CATEGORIES & SUBCATEGORIES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  businessCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
  businessCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

