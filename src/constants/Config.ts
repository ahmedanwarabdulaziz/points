/**
 * App Configuration Constants
 */

export const Config = {
  APP_NAME: 'Points Redeem',
  APP_VERSION: '1.0.0',
  
  // Typography
  FONTS: {
    header: 'Playfair Display',  // Serif for headers
    body: 'Source Sans Pro',     // Sans-serif for body
    mono: 'monospace',           // For numbers/points
  },
  
  // Sizing
  SPACING: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  BORDER_RADIUS: {
    sm: 4,
    md: 8,
    lg: 16,
    pill: 999,
  },
  
  // Points System
  POINTS: {
    DEFAULT_EARNING_RATE: 1,          // 1 point per $1
    DEFAULT_HOME_REDEMPTION_RATE: 10, // 10 points = $1 at home business
    DEFAULT_EXTERNAL_REDEMPTION_RATE: 20, // 20 points = $1 at other businesses
    DEFAULT_EXPIRATION_MONTHS: 12,
  },
  
  // Transaction Limits
  LIMITS: {
    MAX_TRANSACTION_AMOUNT: 10000,
    DEFAULT_APPROVAL_THRESHOLD: 500,
    MAX_STAFF_DAILY_POINTS: 10000,
    MAX_REFERRALS_DISPLAY: 100,
  },
  
  // QR Code
  QR: {
    SCAN_TIMEOUT: 30000,              // 30 seconds
    CODE_EXPIRY: 300000,              // 5 minutes for dynamic codes
  },
  
  // Notifications
  NOTIFICATIONS: {
    TAG_EXPIRY_WARNING_DAYS: 30,
    POINTS_EXPIRY_WARNING_DAYS: 30,
  },
  
  // Animations
  ANIMATION: {
    DURATION_SHORT: 200,
    DURATION_MEDIUM: 300,
    DURATION_LONG: 500,
  },
  
  // API & URLs
  API: {
    // Production URL (set this when deploying)
    PRODUCTION_URL: 'https://pointsredeem.app', // Change this to your production domain
    
    // Get current base URL dynamically
    getBaseUrl: () => {
      if (typeof window !== 'undefined') {
        // Web platform - use current window location
        const { protocol, hostname, port } = window.location;
        const portString = port ? `:${port}` : '';
        return `${protocol}//${hostname}${portString}`;
      }
      // Mobile platform - use production URL
      return 'https://pointsredeem.app';
    },
    
    // Get full registration URL
    getRegistrationUrl: (businessId: string) => {
      const baseUrl = Config.API.getBaseUrl();
      return `${baseUrl}/register?businessId=${businessId}`;
    },
  },
};

export default Config;


