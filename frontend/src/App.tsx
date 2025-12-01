import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes - Coming Soon */}
          {/* 
          <Route 
            path="/executive/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['executive']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            } 
          />
          */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;