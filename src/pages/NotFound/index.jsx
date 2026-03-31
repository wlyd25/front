import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Home, ErrorOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 6,
            borderRadius: 4,
            textAlign: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h5" gutterBottom>
            الصفحة غير موجودة
          </Typography>
          
          <Typography variant="body2" color="textSecondary" paragraph>
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            العودة إلى لوحة التحكم
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}