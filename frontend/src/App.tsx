import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { PageLoader } from './components/shared/PageLoader';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TitleDetailPageNew } from './pages/TitleDetailPageNew';
import { TitleDetailDebug } from './pages/TitleDetailDebug';
import { FilterSearchPage } from './pages/FilterSearchPage';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { ProductionDashboard } from './pages/ProductionDashboard';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <PageLoader />
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<FilterSearchPage />} />
          <Route path="/titles/:id/debug" element={<TitleDetailDebug />} />
          <Route path="/titles/:id" element={<TitleDetailPageNew />} />

          {/* Protected Routes */}
          <Route 
            path="/executive/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['executive']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/production/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['production']}>
                <ProductionDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        </AuthProvider>
        </LoadingProvider>
        </BrowserRouter>
        );
        }

export default App;