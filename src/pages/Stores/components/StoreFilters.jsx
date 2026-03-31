import { Grid, TextField, MenuItem, Button } from '@mui/material';

const categories = [
  { value: 'all', label: 'الكل' },
  { value: 'restaurant', label: 'مطعم' },
  { value: 'cafe', label: 'مقهى' },
  { value: 'fast_food', label: 'وجبات سريعة' },
  { value: 'bakery', label: 'مخبز' },
  { value: 'grocery', label: 'بقالة' },
  { value: 'pharmacy', label: 'صيدلية' },
  { value: 'store', label: 'متجر' },
  { value: 'supermarket', label: 'سوبر ماركت' },
  { value: 'clothing', label: 'ملابس' },
];

export default function StoreFilters({ filters, onFilterChange, onReset }) {
  return (
    <Grid container spacing={2} mb={3}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="بحث"
          size="small"
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="اسم المتجر، البريد، رقم الهاتف..."
        />
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          select
          label="التصنيف"
          size="small"
          value={filters.category || 'all'}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          {categories.map(c => (
            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          select
          label="الحالة"
          size="small"
          value={filters.status || 'all'}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="open">مفتوح</MenuItem>
          <MenuItem value="closed">مغلق</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} md={2}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onReset}
          sx={{ height: '40px' }}
        >
          مسح الكل
        </Button>
      </Grid>
    </Grid>
  );
}