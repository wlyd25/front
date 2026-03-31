import { Grid, TextField, MenuItem, Button } from '@mui/material';

const statusOptions = [{ value: 'all', label: 'الكل' }, { value: 'pending', label: 'قيد الانتظار' }, { value: 'accepted', label: 'مقبول' }, { value: 'ready', label: 'جاهز' }, { value: 'picked', label: 'تم الاستلام' }, { value: 'delivered', label: 'تم التوصيل' }, { value: 'cancelled', label: 'ملغي' }];

export default function OrderFilters({ filters, onFilterChange, onReset }) {
  return (
    <Grid container spacing={2} mb={3}>
      <Grid item xs={12} md={3}><TextField fullWidth label="بحث" size="small" value={filters.search} onChange={(e) => onFilterChange('search', e.target.value)} placeholder="رقم الطلب، العميل..." /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth select label="الحالة" size="small" value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)}>{statusOptions.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}</TextField></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth type="date" label="من تاريخ" size="small" value={filters.fromDate} onChange={(e) => onFilterChange('fromDate', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth type="date" label="إلى تاريخ" size="small" value={filters.toDate} onChange={(e) => onFilterChange('toDate', e.target.value)} InputLabelProps={{ shrink: true }} /></Grid>
      <Grid item xs={12} md={3}><Button fullWidth variant="outlined" onClick={onReset}>مسح الفلترة</Button></Grid>
    </Grid>
  );
}