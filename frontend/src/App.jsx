import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { UsersPage } from './pages/UsersPage';
import { PanelsPage } from './pages/PanelsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProtocolsPage } from './pages/ProtocolsPage';
import { ProtocolSchemaPage } from './pages/ProtocolSchemaPage';
import { ReportTemplateBuilderPage } from './pages/ReportTemplateBuilderPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ProgramNamesPage } from './pages/ProgramNamesPage';
import { AppointmentTypesPage } from './pages/AppointmentTypesPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BreadcrumbProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route
                  path="customers"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <CustomersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="institutions"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'account']}>
                      <InstitutionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'account', 'institution']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="panels"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'account', 'institution']}>
                      <PanelsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="categories"
                  element={
                    <ProtectedRoute allowedRoles={['account']}>
                      <CategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="categories/:categoryId/protocols"
                  element={
                    <ProtectedRoute allowedRoles={['account']}>
                      <ProtocolsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="categories/:categoryId/protocols/:protocolId/schema"
                  element={
                    <ProtectedRoute allowedRoles={['account']}>
                      <ProtocolSchemaPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="categories/:categoryId/protocols/:protocolId/report-template"
                  element={
                    <ProtectedRoute allowedRoles={['account']}>
                      <ReportTemplateBuilderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="programs"
                  element={
                    <ProtectedRoute allowedRoles={['account']}>
                      <ProgramsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="programs/:typeId/names"
                  element={
                    <ProtectedRoute allowedRoles={['account']}>
                      <ProgramNamesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="appointment-types"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin', 'account']}>
                      <AppointmentTypesPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BreadcrumbProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
