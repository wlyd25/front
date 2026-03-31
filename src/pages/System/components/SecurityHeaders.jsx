import { useQuery } from 'react-query';
import { Paper, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { systemService } from '../../../api';

export default function SecurityHeaders() {
  const { data: securityHeaders, isLoading } = useQuery('security-headers', () => systemService.getSecurityHeaders());
  
  if (isLoading) return <CircularProgress />;
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>رؤوس الأمان</Typography>
      <List dense>
        {securityHeaders?.data?.map((header) => (
          <ListItem key={header.name}>
            <ListItemText primary={header.name} secondary={header.value} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}