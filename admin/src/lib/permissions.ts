export const PERMISSIONS = {
  ORDERS_VIEW: 'orders_view',
  ORDERS_EDIT: 'orders_edit',
  PRODUCTS_VIEW: 'products_view',
  PRODUCTS_EDIT: 'products_edit',
  CATEGORIES_MANAGE: 'categories_manage',
  REVIEWS_MANAGE: 'reviews_manage',
  FAQS_MANAGE: 'faqs_manage',
  PROMO_CODES_MANAGE: 'promo_codes_manage',
  TRANSLATIONS_MANAGE: 'translations_manage',
  SETTINGS_MANAGE: 'settings_manage',
  AI_MANAGE: 'ai_manage',
  MODERATORS_MANAGE: 'moderators_manage',
  CUSTOMIZATIONS_MANAGE: 'customizations_manage',
  DATABASE_BACKUP: 'database_backup',
  VIEW_SENSITIVE_INFO: 'view_sensitive_info',
  EDIT_ALL_PROFILE_INFO: 'edit_all_profile_info',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: string;
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  {
    key: PERMISSIONS.ORDERS_VIEW,
    label: 'View Orders',
    category: 'Orders & Sales',
    description: 'View orders list, order details, invoices, and shipping labels.',
  },
  {
    key: PERMISSIONS.ORDERS_EDIT,
    label: 'Manage & Edit Orders',
    category: 'Orders & Sales',
    description: 'Update order statuses, internal notes, and switch payment methods.',
  },
  {
    key: PERMISSIONS.PRODUCTS_VIEW,
    label: 'View Products',
    category: 'Catalog & Inventory',
    description: 'View products list and inventory variants.',
  },
  {
    key: PERMISSIONS.PRODUCTS_EDIT,
    label: 'Create & Edit Products',
    category: 'Catalog & Inventory',
    description: 'Create, update, and delete products, variations, and image galleries.',
  },
  {
    key: PERMISSIONS.CATEGORIES_MANAGE,
    label: 'Manage Categories',
    category: 'Catalog & Inventory',
    description: 'Add, edit, or delete store categories.',
  },
  {
    key: PERMISSIONS.REVIEWS_MANAGE,
    label: 'Moderate Customer Reviews',
    category: 'Community & Content',
    description: 'Approve, reject, publish, or feature customer product reviews.',
  },
  {
    key: PERMISSIONS.FAQS_MANAGE,
    label: 'Manage FAQs',
    category: 'Community & Content',
    description: 'Add, update, and organize frequently asked questions.',
  },
  {
    key: PERMISSIONS.PROMO_CODES_MANAGE,
    label: 'Manage Promo Codes',
    category: 'Marketing & Discounts',
    description: 'Create and manage discount coupons and promotional campaigns.',
  },
  {
    key: PERMISSIONS.TRANSLATIONS_MANAGE,
    label: 'Manage Translations',
    category: 'Localization',
    description: 'Edit English and Bengali translation keys in the dictionary.',
  },
  {
    key: PERMISSIONS.SETTINGS_MANAGE,
    label: 'Store & Gateway Settings',
    category: 'System Configuration',
    description: 'Modify store branding, delivery pricing, and payment gateways.',
  },
  {
    key: PERMISSIONS.AI_MANAGE,
    label: 'AI Multi-Agent Studio',
    category: 'System Configuration',
    description: 'Configure and test AI providers and model settings.',
  },
  {
    key: PERMISSIONS.MODERATORS_MANAGE,
    label: 'Manage Moderators & Team',
    category: 'User Administration',
    description: 'Add, update, or remove moderators and assign permissions.',
  },
  {
    key: PERMISSIONS.CUSTOMIZATIONS_MANAGE,
    label: 'Custom Orders & Requests',
    category: 'Orders & Sales',
    description: 'View, review, update status, and manage custom map requests from customers.',
  },
  {
    key: PERMISSIONS.DATABASE_BACKUP,
    label: 'Database Backup & Restore',
    category: 'System Configuration',
    description: 'Export snapshots, create backups, and import/restore database.',
  },
  {
    key: PERMISSIONS.VIEW_SENSITIVE_INFO,
    label: 'View Confidential Profile Info',
    category: 'Security & Privacy',
    description: 'Permission to view NID card photos, NID numbers, and personal addresses of other team members.',
  },
  {
    key: PERMISSIONS.EDIT_ALL_PROFILE_INFO,
    label: 'Edit Any Staff Profile Info',
    category: 'Security & Privacy',
    description: 'Authorize editing confidential details (NID, legal name, address) for other staff.',
  },
];

export const PERMISSION_PRESETS: { name: string; description: string; permissions: PermissionKey[] }[] = [
  {
    name: 'Full Moderator',
    description: 'Access to Orders, Catalog, Reviews, and FAQs',
    permissions: [
      PERMISSIONS.ORDERS_VIEW,
      PERMISSIONS.ORDERS_EDIT,
      PERMISSIONS.CUSTOMIZATIONS_MANAGE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_EDIT,
      PERMISSIONS.CATEGORIES_MANAGE,
      PERMISSIONS.REVIEWS_MANAGE,
      PERMISSIONS.FAQS_MANAGE,
    ],
  },
  {
    name: 'Order Operations Manager',
    description: 'Focused strictly on order fulfillment and customer inquiries',
    permissions: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_EDIT, PERMISSIONS.CUSTOMIZATIONS_MANAGE, PERMISSIONS.PRODUCTS_VIEW],
  },
  {
    name: 'Catalog & Content Specialist',
    description: 'Product listing, photo gallery, categories, and FAQs management',
    permissions: [
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_EDIT,
      PERMISSIONS.CATEGORIES_MANAGE,
      PERMISSIONS.FAQS_MANAGE,
      PERMISSIONS.REVIEWS_MANAGE,
    ],
  },
  {
    name: 'Customer Support & Reviews',
    description: 'Order lookup, review moderation, and FAQ updates',
    permissions: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.REVIEWS_MANAGE, PERMISSIONS.FAQS_MANAGE],
  },
];

/**
 * Checks if a user has a specific permission.
 * Admins always have all permissions.
 */
export function hasPermission(
  user: { role?: string; permissions?: string | string[] | null } | null | undefined,
  permission: string,
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!user.permissions) return false;

  try {
    const list: string[] = Array.isArray(user.permissions)
      ? user.permissions
      : JSON.parse(user.permissions);
    return list.includes('*') || list.includes(permission);
  } catch {
    return false;
  }
}
