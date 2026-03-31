import { Grid, TextField, MenuItem, Button } from '@mui/material';

const categories = [{ value: 'all', label: 'الكل' }, { value: 'main', label: 'وجبات رئيسية' }, { value: 'appetizer', label: 'مقبلات' }, { value: 'beverage', label: 'مشروبات' }];

export default function ProductFilters({ filters, stores = [], onFilterChange, onReset }) {
  return (
    <Grid container spacing={2} mb={3}>
      <Grid item xs={12} md={3}><TextField fullWidth label="بحث" size="small" value={filters.search} onChange={(e) => onFilterChange('search', e.target.value)} placeholder="اسم المنتج..." /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth select label="التصنيف" size="small" value={filters.category} onChange={(e) => onFilterChange('category', e.target.value)}>{categories.map(c => (<MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>))}</TextField></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth select label="المتجر" size="small" value={filters.store} onChange={(e) => onFilterChange('store', e.target.value)}><MenuItem value="all">الكل</MenuItem>{stores.map(s => (<MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>))}</TextField></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth select label="الحالة" size="small" value={filters.availability} onChange={(e) => onFilterChange('availability', e.target.value)}><MenuItem value="all">الكل</MenuItem><MenuItem value="available">متاح</MenuItem><MenuItem value="unavailable">غير متاح</MenuItem></TextField></Grid>
      <Grid item xs={12} md={3}><Button fullWidth variant="outlined" onClick={onReset}>مسح الفلترة</Button></Grid>
    </Grid>
  );
}