import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Farmer pages
import DashboardPage from './pages/farmer/DashboardPage';
import FarmsPage from './pages/farmer/FarmsPage';
import CropsPage from './pages/farmer/CropsPage';
import ExpensesPage from './pages/farmer/ExpensesPage';
import SalesPage from './pages/farmer/SalesPage';
import AiToolsPage from './pages/farmer/AiToolsPage';
import WeatherPage from './pages/farmer/WeatherPage';
import SchemesPage from './pages/farmer/SchemesPage';
import MarketplacePage from './pages/farmer/MarketplacePage';
import ReportsPage from './pages/farmer/ReportsPage';
import ProfilePage from './pages/farmer/ProfilePage';

// Buyer pages
import BuyerDashboardPage from './pages/buyer/BuyerDashboardPage';
import BuyerListingsPage from './pages/buyer/BuyerListingsPage';
import BuyerOrdersPage from './pages/buyer/BuyerOrdersPage';

// Admin pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminFarmsPage from './pages/admin/AdminFarmsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected app shell */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Farmer routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="farms" element={<FarmsPage />} />
          <Route path="crops" element={<CropsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="ai" element={<AiToolsPage />} />
          <Route path="weather" element={<WeatherPage />} />
          <Route path="schemes" element={<SchemesPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Buyer routes */}
          <Route
            path="buyer/dashboard"
            element={<ProtectedRoute roles={['buyer']}><BuyerDashboardPage /></ProtectedRoute>}
          />
          <Route
            path="buyer/listings"
            element={<ProtectedRoute roles={['buyer']}><BuyerListingsPage /></ProtectedRoute>}
          />
          <Route
            path="buyer/orders"
            element={<ProtectedRoute roles={['buyer']}><BuyerOrdersPage /></ProtectedRoute>}
          />

          {/* Admin routes */}
          <Route
            path="admin/overview"
            element={<ProtectedRoute roles={['admin']}><AdminOverviewPage /></ProtectedRoute>}
          />
          <Route
            path="admin/users"
            element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>}
          />
          <Route
            path="admin/farms"
            element={<ProtectedRoute roles={['admin']}><AdminFarmsPage /></ProtectedRoute>}
          />
          <Route
            path="admin/audit-logs"
            element={<ProtectedRoute roles={['admin']}><AdminAuditLogsPage /></ProtectedRoute>}
          />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
