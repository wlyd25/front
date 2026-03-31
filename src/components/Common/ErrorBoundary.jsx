import { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default" p={3}>
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
            <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>حدث خطأ غير متوقع</Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {this.state.error?.message || 'عذراً، حدث خطأ في التطبيق.'}
            </Typography>
            {this.state.errorInfo && (
              <Typography variant="caption" color="textSecondary" component="pre" sx={{ textAlign: 'left', overflow: 'auto', maxHeight: 200, p: 1, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
                {this.state.errorInfo.componentStack}
              </Typography>
            )}
            <Button variant="contained" onClick={this.handleReset}>
              إعادة تحميل الصفحة
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;