import * as Yup from 'yup';

// التحقق من رقم الهاتف السعودي
export const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;

// التحقق من البريد الإلكتروني
export const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;

// التحقق من كلمة المرور (6 أحرف على الأقل)
export const passwordRegex = /^.{6,}$/;

// Schema للمستخدم
export const userSchema = Yup.object({
  name: Yup.string()
    .required('الاسم مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'الاسم طويل جداً'),
  phone: Yup.string()
    .required('رقم الهاتف مطلوب')
    .matches(phoneRegex, 'رقم هاتف غير صحيح'),
  email: Yup.string()
    .email('بريد إلكتروني غير صحيح'),
  password: Yup.string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: Yup.string()
    .required('الدور مطلوب')
    .oneOf(['admin', 'vendor', 'driver', 'client'], 'دور غير صحيح'),
});

// Schema للمتجر
export const storeSchema = Yup.object({
  name: Yup.string()
    .required('اسم المتجر مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'الاسم طويل جداً'),
  description: Yup.string()
    .max(500, 'الوصف طويل جداً'),
  category: Yup.string()
    .required('التصنيف مطلوب'),
  phone: Yup.string()
    .required('رقم الهاتف مطلوب')
    .matches(phoneRegex, 'رقم هاتف غير صحيح'),
  email: Yup.string()
    .email('بريد إلكتروني غير صحيح'),
});

// Schema للمنتج
export const productSchema = Yup.object({
  name: Yup.string()
    .required('اسم المنتج مطلوب')
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً'),
  price: Yup.number()
    .required('السعر مطلوب')
    .positive('السعر يجب أن يكون موجباً')
    .min(0, 'السعر لا يمكن أن يكون سالباً'),
  category: Yup.string()
    .required('التصنيف مطلوب'),
  description: Yup.string()
    .max(500, 'الوصف طويل جداً'),
  preparationTime: Yup.number()
    .min(0, 'وقت التحضير لا يمكن أن يكون سالباً')
    .max(60, 'وقت التحضير طويل جداً'),
});

// Schema للطلب
export const orderSchema = Yup.object({
  items: Yup.array()
    .min(1, 'يجب أن يحتوي الطلب على منتج واحد على الأقل')
    .required('المنتجات مطلوبة'),
  deliveryAddress: Yup.string()
    .required('عنوان التوصيل مطلوب'),
});

// التحقق من الصلاحيات
export const hasPermission = (user, requiredRole) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.role === requiredRole;
};

// التحقق من أن المستخدم أدمن
export const isAdmin = (user) => {
  return user?.role === 'admin';
};