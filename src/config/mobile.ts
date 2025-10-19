// Global Mobile Layout Configuration
// This ensures consistent mobile layouts across all pages

export const MOBILE_CONFIG = {
  // Breakpoints (matching Tailwind CSS)
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // Consistent spacing
  spacing: {
    // Page-level spacing
    pagePadding: 'p-4 lg:p-6',
    pageSpacing: 'space-y-6 lg:space-y-8',
    
    // Card spacing
    cardPadding: 'p-4 lg:p-6',
    cardSpacing: 'space-y-4 lg:space-y-6',
    
    // Mobile-specific spacing
    mobilePadding: 'p-4',
    mobileSpacing: 'space-y-4',
    mobileGap: 'gap-4'
  },

  // Grid layouts for mobile
  grids: {
    // Stats cards - 2 columns on mobile, 4 on desktop
    statsCards: 'grid-cols-2 lg:grid-cols-4',
    
    // Action cards - 1 column on mobile, 3 on desktop  
    actionCards: 'grid-cols-1 lg:grid-cols-3',
    
    // Filter controls - 1 column on mobile, auto on larger screens
    filterControls: 'grid-cols-1 sm:grid-cols-3 lg:flex',
    
    // Form fields - 1 column on mobile, 2 on desktop
    formFields: 'grid-cols-1 lg:grid-cols-2'
  },

  // Text sizes for mobile
  textSizes: {
    // Headings
    h1: 'text-2xl lg:text-3xl',
    h2: 'text-xl lg:text-2xl', 
    h3: 'text-lg lg:text-xl',
    
    // Body text
    body: 'text-sm lg:text-base',
    small: 'text-xs lg:text-sm',
    
    // Labels
    label: 'text-xs lg:text-sm',
    
    // Stats
    statLabel: 'text-xs lg:text-sm',
    statValue: 'text-sm lg:text-2xl'
  },

  // Button sizes
  buttons: {
    small: 'py-2 px-3 text-sm',
    medium: 'py-2.5 px-4 text-sm lg:text-base',
    large: 'py-3 px-6 text-base lg:text-lg'
  },

  // Input sizes
  inputs: {
    small: 'py-2 px-3 text-sm',
    medium: 'py-2.5 px-4 text-sm lg:text-base',
    large: 'py-3 px-4 text-base'
  },

  // Container styles
  containers: {
    // White cards with consistent styling
    card: 'bg-white rounded-lg shadow-sm border border-gray-200',
    
    // Modal containers
    modal: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto',
    
    // Table containers
    table: 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
  },

  // Mobile-specific utilities
  mobile: {
    // Full width on mobile, auto on desktop
    fullWidthMobile: 'w-full lg:w-auto',
    
    // Stack on mobile, row on desktop
    stackMobile: 'flex flex-col lg:flex-row',
    
    // Center on mobile, left on desktop
    centerMobile: 'text-center lg:text-left',
    
    // Hide on mobile, show on desktop
    hideMobile: 'hidden lg:block',
    
    // Show on mobile, hide on desktop
    showMobile: 'block lg:hidden',
    
    // Mobile table overflow
    tableOverflow: 'overflow-x-auto -mx-4 lg:mx-0'
  }
};

// Helper functions for consistent mobile layouts
export const getMobileClasses = {
  // Get consistent card classes
  card: () => `${MOBILE_CONFIG.containers.card} ${MOBILE_CONFIG.spacing.cardPadding}`,
  
  // Get consistent button classes
  button: (size: 'small' | 'medium' | 'large' = 'medium') => 
    `rounded-lg font-medium transition-colors ${MOBILE_CONFIG.buttons[size]}`,
  
  // Get consistent input classes  
  input: (size: 'small' | 'medium' | 'large' = 'medium') =>
    `border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange ${MOBILE_CONFIG.inputs[size]}`,
    
  // Get consistent text classes
  heading: (level: 1 | 2 | 3 = 1) => 
    `font-bold text-navy ${MOBILE_CONFIG.textSizes[`h${level}` as keyof typeof MOBILE_CONFIG.textSizes]}`,
    
  // Get consistent grid classes
  grid: (type: keyof typeof MOBILE_CONFIG.grids) => 
    `grid gap-4 lg:gap-6 ${MOBILE_CONFIG.grids[type]}`
};
