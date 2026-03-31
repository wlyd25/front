import { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { DateRange } from '@mui/icons-material';

export default function DateRangePicker({ onApply, initialFrom, initialTo }) {
  const [from, setFrom] = useState(initialFrom || '');
  const [to, setTo] = useState(initialTo || '');
  
  const handleApply = () => {
    onApply({ from, to });
  };
  
  const handleReset = () => {
    setFrom('');
    setTo('');
    onApply({ from: '', to: '' });
  };
  
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <TextField
        type="date"
        label="من تاريخ"
        size="small"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        type="date"
        label="إلى تاريخ"
        size="small"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <Button variant="outlined" onClick={handleApply} startIcon={<DateRange />}>
        تطبيق
      </Button>
      <Button variant="text" onClick={handleReset}>
        مسح
      </Button>
    </Box>
  );
}