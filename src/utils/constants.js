// أدوار المستخدمين
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  DRIVER: 'driver',
  CLIENT: 'client',
};

// حالات الطلب
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  READY: 'ready',
  PICKED: 'picked',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// حالات الدفع
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// طرق الدفع
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  WALLET: 'wallet',
};

// تصنيفات المتاجر
export const STORE_CATEGORIES = [
  { value: 'restaurant', label: 'مطعم' },
  { value: 'cafe', label: 'مقهى' },
  { value: 'fast_food', label: 'وجبات سريعة' },
  { value: 'bakery', label: 'مخبز' },
  { value: 'grocery', label: 'بقالة' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'store', label: 'متجر' },
  { value: 'other', label: 'أخرى' },
];

// تصنيفات المنتجات الشائعة
export const PRODUCT_CATEGORIES = [
  'وجبات رئيسية',
  'مقبلات',
  'مشروبات',
  'حلويات',
  'سلطات',
  'عصائر',
  'قهوة',
];

// أيقونات الحالة
export const STATUS_ICONS = {
  [ORDER_STATUS.PENDING]: '⏳',
  [ORDER_STATUS.ACCEPTED]: '✅',
  [ORDER_STATUS.READY]: '🍽️',
  [ORDER_STATUS.PICKED]: '🚗',
  [ORDER_STATUS.DELIVERED]: '🏠',
  [ORDER_STATUS.CANCELLED]: '❌',
};

// ألوان الحالة
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#ff9800',
  [ORDER_STATUS.ACCEPTED]: '#2196f3',
  [ORDER_STATUS.READY]: '#4caf50',
  [ORDER_STATUS.PICKED]: '#9c27b0',
  [ORDER_STATUS.DELIVERED]: '#4caf50',
  [ORDER_STATUS.CANCELLED]: '#f44336',
};

// إعدادات pagination الافتراضية
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

// رسائل الخطأ الشائعة
export const ERROR_MESSAGES = {
  NETWORK: 'حدث خطأ في الاتصال بالخادم',
  UNAUTHORIZED: 'غير مصرح بالدخول، يرجى تسجيل الدخول',
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا المورد',
  NOT_FOUND: 'المورد المطلوب غير موجود',
  VALIDATION: 'بيانات غير صحيحة، يرجى التحقق من المدخلات',
  SERVER: 'حدث خطأ في الخادم، الرجاء المحاولة لاحقاً',
};

// رسائل النجاح
export const SUCCESS_MESSAGES = {
  CREATE: 'تم الإنشاء بنجاح',
  UPDATE: 'تم التحديث بنجاح',
  DELETE: 'تم الحذف بنجاح',
  ACTIVATE: 'تم التفعيل بنجاح',
  DEACTIVATE: 'تم التعطيل بنجاح',
  VERIFY: 'تم التوثيق بنجاح',
  ASSIGN: 'تم التعيين بنجاح',
};