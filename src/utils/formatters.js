import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'yyyy-MM-dd HH:mm') => {
  if (!date) return '-';
  try {
    return format(new Date(date), formatStr, { locale: arSA });
  } catch (error) {
    return date;
  }
};

export const formatCurrency = (amount, currency = 'SAR') => {
  if (amount === undefined || amount === null) return '-';
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number, decimals = 0) => {
  if (number === undefined || number === null) return '-';
  return new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  // تنسيق رقم الهاتف العربي
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};

export const formatStatus = (status) => {
  const statusMap = {
    pending: 'قيد الانتظار',
    accepted: 'مقبول',
    ready: 'جاهز',
    picked: 'تم الاستلام',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
    active: 'نشط',
    inactive: 'غير نشط',
    verified: 'موثق',
    unverified: 'غير موثق',
  };
  return statusMap[status] || status;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};