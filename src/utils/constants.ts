// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ADMIN_LOGIN: '/api/admin/login',
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
  },
  PROPERTIES: {
    LIST: '/properties',
    DETAIL: '/properties/:id',
    CREATE: '/properties',
    UPDATE: '/properties/:id',
    DELETE: '/properties/:id',
    SEARCH: '/properties/search',
    UPDATE_VISIBILITY: '/properties/:id/visibility',
    ADMIN_APPROVE: '/admin/properties/:id/approve',
    ADMIN_REJECT: '/admin/properties/:id/reject',
  },
  USERS: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
  SELLER: {
    PROPERTIES: '/seller/properties',
    ADDONS: '/seller/addons',
    PURCHASE_ADDON: '/seller/addons/:id/purchase',
  },
  BUYER: {
    SAVED_PROPERTIES: '/buyer/saved-properties',
    SAVE_PROPERTY: '/buyer/properties/:id/save',
    CONTACT_ADMIN: '/buyer/contact-admin',
    UNLOCK_PROPERTY: '/buyer/unlock-property',
    UNLOCKED_PROPERTIES: '/buyer/unlocked-properties',
  },
  AGENT: {
    ASSIGNMENTS: '/agent/assignments',
    INSPECTIONS: '/agent/inspections',
    MESSAGES: '/agent/messages',
    UPDATE_INSPECTION: '/agent/inspections/:id',
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/mark-all-read',
    CREATE: '/notifications',
    EMAIL: '/notifications/email',
  },
  INSPECTIONS: {
    LIST: '/inspections',
    CREATE: '/inspections',
    UPDATE: '/inspections/:id',
    DELETE: '/inspections/:id',
    SEND_REMINDER: '/inspections/:id/reminder',
  },
  MESSAGES: {
    LIST: '/messages',
    SEND: '/messages',
    CONVERSATION: '/messages/conversation/:conversationId',
    MARK_READ: '/messages/:messageId/read',
    MARK_ALL_READ: '/messages/conversation/:conversationId/read-all',
    CONVERSATIONS: '/messages/conversations',
  },
  ADMIN: {
    ANALYTICS: '/api/admin/analytics',
    USERS: '/api/admin/users',
    USER_SUSPEND: '/api/admin/users/:id/suspend',
    USER_DELETE: '/api/admin/users/:id',
    LISTINGS: '/api/admin/listings',
    LISTING_STATUS: '/api/admin/listings/:id/status',
    LISTING_DELETE: '/api/admin/listings/:id',
    FLAGS: '/api/admin/flags',
    FLAG_ACTION: '/api/admin/flags/:id/action',
    PAYMENTS: '/api/admin/payments',
    ASSIGNMENTS: '/api/admin/assignments',
    ASSIGNMENT_UPDATE: '/api/admin/assignments/:id',
    TERMS_LOGS: '/api/admin/terms-logs',
  },
} as const;

// Property Types
export const PROPERTY_TYPES = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  CONDO: 'condo',
  TOWNHOUSE: 'townhouse',
  LAND: 'land',
  COMMERCIAL: 'commercial',
} as const;

// Property Status
export const PROPERTY_STATUS = {
  PENDING: 'pending',    // Awaiting media uploads OR admin approval
  PRIVATE: 'private',    // Visible only to users who unlocked it
  PUBLIC: 'public',      // Visible in search but locked until unlocked
  SOLD: 'sold',
  WITHDRAWN: 'withdrawn',
} as const;

export const LISTING_VISIBILITY = {
  PENDING: {
    label: 'Pending',
    description: 'Listing is awaiting required media uploads or admin approval before going public',
    color: 'bg-yellow-100 text-yellow-800',
    canEdit: false,
    searchable: false,
  },
  PRIVATE: {
    label: 'Private',
    description: 'Listing is visible only to users who have unlocked it; does not appear in public search results',
    color: 'bg-blue-100 text-blue-800',
    canEdit: true,
    searchable: false,
  },
  PUBLIC: {
    label: 'Public',
    description: 'Listing is visible in public search results but in a locked view until unlocked by a buyer',
    color: 'bg-green-100 text-green-800',
    canEdit: true,
    searchable: true,
  },
} as const;

// User Types
export const USER_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  AGENT: 'agent',
  ADMIN: 'admin',
} as const;

// Inspection Status
export const INSPECTION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Message Status
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
} as const;

// Addon Types
export const ADDON_TYPES = {
  PREMIUM_LISTING: 'premium_listing',
  VIRTUAL_TOUR: 'virtual_tour',
  PROFESSIONAL_PHOTOS: 'professional_photos',
  FEATURED_PROPERTY: 'featured_property',
} as const;

// Price Ranges
import { formatCurrencyCompact } from './currency';

export const PRICE_RANGES = [
  { label: `Under ${formatCurrencyCompact(100000)}`, min: 0, max: 100000 },
  { label: `${formatCurrencyCompact(100000)} - ${formatCurrencyCompact(200000)}`, min: 100000, max: 200000 },
  { label: `${formatCurrencyCompact(200000)} - ${formatCurrencyCompact(300000)}`, min: 200000, max: 300000 },
  { label: `${formatCurrencyCompact(300000)} - ${formatCurrencyCompact(400000)}`, min: 300000, max: 400000 },
  { label: `${formatCurrencyCompact(400000)} - ${formatCurrencyCompact(500000)}`, min: 400000, max: 500000 },
  { label: `${formatCurrencyCompact(500000)}+`, min: 500000, max: null },
] as const;

// Bedroom Options
export const BEDROOM_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
] as const;

// Bathroom Options
export const BATHROOM_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Admin-specific constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

export const FLAG_TYPES = {
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  SPAM: 'spam',
  MISLEADING_INFO: 'misleading_info',
  FAKE_LISTING: 'fake_listing',
  HARASSMENT: 'harassment',
} as const;

export const FLAG_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DISMISSED: 'dismissed',
  REMOVED: 'removed',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_TYPES = {
  PROPERTY_UNLOCK: 'property_unlock',
  PREMIUM_LISTING: 'premium_listing',
  VIRTUAL_TOUR: 'virtual_tour',
  PROFESSIONAL_PHOTOS: 'professional_photos',
  FEATURED_PROPERTY: 'featured_property',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  AGENTS: '/agents',
  SIGNIN: '/signin',
  PROPERTY: {
    DETAIL: '/property/:id',
    ADD: '/property/add',
    WITHDRAW: '/property/withdraw',
  },
  DASHBOARDS: {
    SELLER: {
      MAIN: '/dashboards/seller',
      REGISTER: '/sell/onboard',
      ADD_PROPERTY: '/dashboards/seller/add-property',
      ADDONS: '/dashboards/seller/addons',
    },
    BUYER: {
      MAIN: '/dashboards/buyer',
      CREATE_ACCOUNT: '/buy/onboard',
      VIEW_DETAILS: '/dashboards/buyer/view-details',
      CONTACT_ADMIN: '/dashboards/buyer/contact-admin',
    },
    AGENT: {
      MAIN: '/dashboards/agent',
      FLOW: '/dashboards/agent/flow',
      ASSIGNMENTS: '/dashboards/agent/assignments',
      INSPECTIONS: '/dashboards/agent/manage-inspections',
      MESSAGES: '/dashboards/agent/messages',
    },
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  REGISTER_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Successfully logged out',
  PROPERTY_ADDED: 'Property added successfully',
  PROPERTY_UPDATED: 'Property updated successfully',
  PROPERTY_DELETED: 'Property deleted successfully',
  MESSAGE_SENT: 'Message sent successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  PROPERTY_UNLOCKED: 'property_unlocked',
  INSPECTION_BOOKED: 'inspection_booked',
  NEW_MATCH: 'new_match',
  STATUS_UPDATE: 'status_update',
  NEW_ASSIGNMENT: 'new_assignment',
  INQUIRY_RECEIVED: 'inquiry_received',
  INSPECTION_SCHEDULED: 'inspection_scheduled',
} as const;