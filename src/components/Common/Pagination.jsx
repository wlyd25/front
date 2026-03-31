import { Box, Button, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) {
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalItems);
  
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="textSecondary">
          عرض {startItem} - {endItem} من {totalItems}
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          size="small"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronRight />
        </Button>
        
        <Typography variant="body2">
          صفحة {page + 1} من {totalPages}
        </Typography>
        
        <Button
          size="small"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
        >
          <ChevronLeft />
        </Button>
      </Box>
    </Box>
  );
}