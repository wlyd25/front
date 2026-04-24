// src/App.jsx - النسخة المصححة بالكامل

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider, useThemeContext } from './context/ThemeContext';
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/Common/PrivateRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { getTheme } from './styles/theme';

// ✅ Lazy loading للصفحات
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Vendors = lazy(() => import('./pages/Vendors'));
const Stores = lazy(() => import('./pages/Stores'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const Drivers = lazy(() => import('./pages/Drivers'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const AdvancedStats = lazy(() => import('./pages/AdvancedStats'));
const System = lazy(() => import('./pages/System'));
const NotFound = lazy(() => import('./pages/NotFound'));
const MapPage = lazy(() => import('./pages/Map'));

// ✅ مكون تحميل موحد
const PageLoader = () => <LoadingSpinner />;

// ✅ مكون Suspense wrapper لكل صفحة
const SuspensePage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

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
            {/* ✅ صفحة تسجيل الدخول */}
            <Route 
              path="/login" 
              element={
                <SuspensePage>
                  <Login />
                </SuspensePage>
              } 
            />
            
            {/* ✅ المسارات المحمية */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <SuspensePage>
                    <MainLayout />
                  </SuspensePage>
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              <Route 
                path="dashboard" 
                element={
                  <SuspensePage>
                    <Dashboard />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="users" 
                element={
                  <SuspensePage>
                    <Users />
                  </SuspensePage>
                } 
              />
              <Route 
                path="users/:id" 
                element={
                  <SuspensePage>
                    <Users />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="vendors" 
                element={
                  <SuspensePage>
                    <Vendors />
                  </SuspensePage>
                } 
              />
              <Route 
                path="vendors/:id" 
                element={
                  <SuspensePage>
                    <Vendors />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="stores" 
                element={
                  <SuspensePage>
                    <Stores />
                  </SuspensePage>
                } 
              />
              <Route 
                path="stores/:id" 
                element={
                  <SuspensePage>
                    <Stores />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="products" 
                element={
                  <SuspensePage>
                    <Products />
                  </SuspensePage>
                } 
              />
              <Route 
                path="products/:id" 
                element={
                  <SuspensePage>
                    <Products />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="orders" 
                element={
                  <SuspensePage>
                    <Orders />
                  </SuspensePage>
                } 
              />
              <Route 
                path="orders/:id" 
                element={
                  <SuspensePage>
                    <Orders />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="drivers" 
                element={
                  <SuspensePage>
                    <Drivers />
                  </SuspensePage>
                } 
              />
              <Route 
                path="drivers/:id" 
                element={
                  <SuspensePage>
                    <Drivers />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="notifications" 
                element={
                  <SuspensePage>
                    <Notifications />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="analytics" 
                element={
                  <SuspensePage>
                    <Analytics />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="reports" 
                element={
                  <SuspensePage>
                    <Reports />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="advanced-stats" 
                element={
                  <SuspensePage>
                    <AdvancedStats />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="system" 
                element={
                  <SuspensePage>
                    <System />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="map" 
                element={
                  <SuspensePage>
                    <MapPage />
                  </SuspensePage>
                } 
              />
              
              <Route 
                path="*" 
                element={
                  <SuspensePage>
                    <NotFound />
                  </SuspensePage>
                } 
              />
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