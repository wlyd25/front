import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect } from 'react';

export default function SearchBar({ onSearch, placeholder = 'بحث...', initialValue = '' }) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 500);
  
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);
  
  const handleClear = () => {
    setValue('');
    onSearch('');
  };
  
  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <Clear fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}