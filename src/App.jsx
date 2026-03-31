import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider, useThemeContext } from './context/ThemeContext';
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/Common/PrivateRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Vendors from './pages/Vendors';
import Stores from './pages/Stores';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import AdvancedStats from './pages/AdvancedStats';
import System from './pages/System';
import NotFound from './pages/NotFound';
import MapPage from './pages/Map';
// Theme
import { getTheme } from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const { mode } = useThemeContext();
  const theme = getTheme(mode);
  
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'inherit',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="users/:id" element={<Users />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="vendors/:id" element={<Vendors />} />
              <Route path="stores" element={<Stores />} />
              <Route path="stores/:id" element={<Stores />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<Orders />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="drivers/:id" element={<Drivers />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="advanced-stats" element={<AdvancedStats />} />
              <Route path="system" element={<System />} />
              <Route path="map" element={<MapPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppContent />
          </BrowserRouter>
        </ThemeContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;