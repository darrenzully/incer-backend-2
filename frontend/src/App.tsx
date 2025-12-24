import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import Notification from './components/Notification';
import { AuthProvider } from './contexts/AuthContext';
import { CenterProvider } from './contexts/CenterContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { refreshToken } from './services/api';
import PreferencesPage from './pages/PreferencesPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import RequirePermission from './components/RequirePermission';
import RolesPage from './pages/RolesPage';
import PermissionsPage from './pages/PermissionsPage';
import PermissionFormPage from './pages/PermissionFormPage';
import PermissionDetailPage from './pages/PermissionDetailPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import UserFormPage from './pages/UserFormPage';
import UserManagementPage from './pages/UserManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import RoleTemplatesPage from './pages/RoleTemplatesPage';
import RoleTemplateFormPage from './pages/RoleTemplateFormPage';
import RoleTemplateDetailPage from './pages/RoleTemplateDetailPage';
import ClientsPage from './pages/ClientsPage';
import ClientesAdminPage from './pages/ClientesAdminPage';
import ClientFormPage from './pages/ClientFormPage';
import ClientDetailPage from './pages/ClientDetailPage';
import SucursalesPage from './pages/SucursalesPage';
import SucursalesAdminPage from './pages/SucursalesAdminPage';
import SucursalDetailPage from './pages/SucursalDetailPage';
import SucursalFormPage from './pages/SucursalFormPage';
import TipoElementosPage from './pages/TipoElementosPage';
import TipoElementoFormPage from './pages/TipoElementoFormPage';
import TipoElementoDetailPage from './pages/TipoElementoDetailPage';
import ExtintoresPage from './pages/ExtintoresPage';
import ExtintorFormPage from './pages/ExtintorFormPage';
import ExtintorDetailPage from './pages/ExtintorDetailPage';
import ElementosPage from './pages/ElementosPage';
import ElementoFormPage from './pages/ElementoFormPage';
import ElementoDetailPage from './pages/ElementoDetailPage';
import PuestosPage from './pages/PuestosPage';
import PuestoFormPage from './pages/PuestoFormPage';
import PuestoDetailPage from './pages/PuestoDetailPage';
import ElementosAdminPage from './pages/ElementosAdminPage';
import TipoElementosAdminPage from './pages/TipoElementosAdminPage';
import ExtintoresAdminPage from './pages/ExtintoresAdminPage';
import CheckListsPage from './pages/CheckListsPage';
import CheckListFormPage from './pages/CheckListFormPage';
import CheckListDetailPage from './pages/CheckListDetailPage';
import PresupuestosPage from './pages/PresupuestosPage';
import PresupuestoFormPage from './pages/PresupuestoFormPage';
import PresupuestoDetailPage from './pages/PresupuestoDetailPage';
import RemitoUsuariosPage from './pages/RemitoUsuariosPage';
import RemitoUsuarioFormPage from './pages/RemitoUsuarioFormPage';
import RemitoUsuarioDetailPage from './pages/RemitoUsuarioDetailPage';
import RemitosPage from './pages/RemitosPage';
import RemitoDetailPage from './pages/RemitoDetailPage';
import TareasPage from './pages/TareasPage';
import TareaFormPage from './pages/TareaFormPage';
import TareaDetailPage from './pages/TareaDetailPage';
import SolicitudesPage from './pages/SolicitudesPage';
import SolicitudDetailPage from './pages/SolicitudDetailPage';
import RelevamientosPage from './pages/RelevamientosPage';
import RelevamientoDetailPage from './pages/RelevamientoDetailPage';
import PuestosRelevadosReportPage from './pages/PuestosRelevadosReportPage';
import ElementosRelevadosReportPage from './pages/ElementosRelevadosReportPage';
import QRsPage from './pages/QRsPage';
import RemitoFormPage from './pages/RemitoFormPage';
import CentersPage from './pages/CentersPage';
import CenterDetailPage from './pages/CenterDetailPage';
import CenterFormPage from './pages/CenterFormPage';
import CalendarPage from './pages/CalendarPage';
import AgendaContactosPage from './pages/AgendaContactosPage';
import AppAccessPage from './pages/AppAccessPage';
import OrdenesTrabajoPage from './pages/OrdenesTrabajoPage';
import OrdenTrabajoFormPage from './pages/OrdenTrabajoFormPage';
import OrdenTrabajoDetailPage from './pages/OrdenTrabajoDetailPage';


const getTokenExp = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const PrivateRoute: React.FC<{ children: React.ReactNode, onExpire: () => void }> = ({ children, onExpire }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      const exp = getTokenExp(token);
      if (exp && Date.now() > exp) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        onExpire();
        navigate('/login');
      }
    }
  }, [token, onExpire, navigate]);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [notification, setNotification] = useState<{ message: string, type?: 'success' | 'error' | 'info' } | null>(null);
  // El tema ahora lo maneja PreferencesPage + index.tsx mediante link CSS
  const [darkMode] = useState(false);

  // Refresh automático de token antes de expirar (simulado)
  useEffect(() => {
    if (!token) return;
    const exp = getTokenExp(token);
    if (!exp) return;
    const now = Date.now();
    const msBeforeExpire = exp - now - 30000; // 30 segundos antes de expirar
    if (msBeforeExpire > 0) {
      const timeout = setTimeout(async () => {
        try {
          const data = await refreshToken();
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setNotification({ message: 'Token refrescado automáticamente.', type: 'info' });
        } catch {
          setNotification({ message: 'No se pudo refrescar el token.', type: 'error' });
        }
      }, msBeforeExpire);
      return () => clearTimeout(timeout);
    }
  }, [token]);

  const handleLogin = () => {
    setToken(localStorage.getItem('token'));
    setNotification({ message: '¡Bienvenido!', type: 'success' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setNotification({ message: 'Sesión cerrada.', type: 'info' });
  };

  const handleExpire = () => {
    setNotification({ message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.', type: 'error' });
    setToken(null);
  };

  // Dark mode is controlled via PreferencesPage and index.tsx

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user.alias || user.email || 'User';

  return (
    <AuthProvider>
      <CenterProvider>
        <PermissionsProvider>
          <Router>
        {!token ? (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} darkMode={darkMode} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        ) : (
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Topbar */}
            <Topbar 
              username={username} 
              onLogout={handleLogout} 
              darkMode={false}
              onToggleDarkMode={() => {}}
            />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/dashboard" element={<PrivateRoute onExpire={handleExpire}><DashboardPage /></PrivateRoute>} />
        
                <Route path="/perfil" element={<PrivateRoute onExpire={handleExpire}><ProfilePage /></PrivateRoute>} />
                <Route path="/preferences" element={<PrivateRoute onExpire={handleExpire}><PreferencesPage /></PrivateRoute>} />
                {/* Gestión Integrada de Seguridad */}
                <Route path="/user-management" element={<PrivateRoute onExpire={handleExpire}><UserManagementPage /></PrivateRoute>} />
                <Route path="/role-management" element={<PrivateRoute onExpire={handleExpire}><RoleManagementPage /></PrivateRoute>} />
                <Route path="/permissions" element={<PrivateRoute onExpire={handleExpire}><PermissionsPage /></PrivateRoute>} />
                <Route path="/permissions/new" element={<PrivateRoute onExpire={handleExpire}><PermissionFormPage /></PrivateRoute>} />
                <Route path="/permissions/edit/:id" element={<PrivateRoute onExpire={handleExpire}><PermissionFormPage /></PrivateRoute>} />
                <Route path="/permissions/:id" element={<PrivateRoute onExpire={handleExpire}><PermissionDetailPage /></PrivateRoute>} />
                <Route path="/applications" element={<PrivateRoute onExpire={handleExpire}><ApplicationsPage /></PrivateRoute>} />
                <Route path="/applications/new" element={<PrivateRoute onExpire={handleExpire}><ApplicationFormPage /></PrivateRoute>} />
                <Route path="/applications/edit/:id" element={<PrivateRoute onExpire={handleExpire}><ApplicationFormPage /></PrivateRoute>} />
                <Route path="/applications/:id" element={<PrivateRoute onExpire={handleExpire}><ApplicationDetailPage /></PrivateRoute>} />
                <Route path="/role-templates" element={<PrivateRoute onExpire={handleExpire}><RoleTemplatesPage /></PrivateRoute>} />
                <Route path="/roletemplates" element={<PrivateRoute onExpire={handleExpire}><RoleTemplatesPage /></PrivateRoute>} />
                <Route path="/roletemplates/new" element={<PrivateRoute onExpire={handleExpire}><RoleTemplateFormPage /></PrivateRoute>} />
                <Route path="/roletemplates/edit/:id" element={<PrivateRoute onExpire={handleExpire}><RoleTemplateFormPage /></PrivateRoute>} />
                <Route path="/roletemplates/:id" element={<PrivateRoute onExpire={handleExpire}><RoleTemplateDetailPage /></PrivateRoute>} />
                
                {/* Rutas legacy - mantener para compatibilidad */}
                <Route path="/roles" element={<PrivateRoute onExpire={handleExpire}><RolesPage /></PrivateRoute>} />
                <Route path="/users" element={<PrivateRoute onExpire={handleExpire}><UsersPage /></PrivateRoute>} />
                <Route path="/users/nuevo" element={<PrivateRoute onExpire={handleExpire}><UserFormPage /></PrivateRoute>} />
                <Route path="/users/:id" element={<PrivateRoute onExpire={handleExpire}><UserDetailPage /></PrivateRoute>} />
                <Route path="/users/edit/:id" element={<PrivateRoute onExpire={handleExpire}><UserFormPage /></PrivateRoute>} />
                <Route path="/clientes" element={<PrivateRoute onExpire={handleExpire}><ClientsPage /></PrivateRoute>} />
                <Route path="/clientes/admin" element={<PrivateRoute onExpire={handleExpire}><ClientesAdminPage /></PrivateRoute>} />
                <Route path="/clientes/nuevo" element={<PrivateRoute onExpire={handleExpire}><ClientFormPage /></PrivateRoute>} />
                <Route path="/clientes/:id" element={<PrivateRoute onExpire={handleExpire}><ClientDetailPage /></PrivateRoute>} />
                <Route path="/clientes/:id/editar" element={<PrivateRoute onExpire={handleExpire}><ClientFormPage /></PrivateRoute>} />
                <Route path="/agenda-contactos" element={<PrivateRoute onExpire={handleExpire}><AgendaContactosPage /></PrivateRoute>} />
                <Route path="/app-access" element={<PrivateRoute onExpire={handleExpire}><AppAccessPage /></PrivateRoute>} />
                <Route path="/sucursales" element={<PrivateRoute onExpire={handleExpire}><SucursalesPage /></PrivateRoute>} />
                <Route path="/sucursales/admin" element={<PrivateRoute onExpire={handleExpire}><SucursalesAdminPage /></PrivateRoute>} />
                <Route path="/sucursales/create" element={<PrivateRoute onExpire={handleExpire}><SucursalFormPage /></PrivateRoute>} />
                
                {/* Rutas de administración para entidades de negocio */}
                <Route path="/puestos/admin" element={<PrivateRoute onExpire={handleExpire}><PuestosPage /></PrivateRoute>} />
                <Route path="/elementos/admin" element={<PrivateRoute onExpire={handleExpire}><ElementosAdminPage /></PrivateRoute>} />
                <Route path="/tipos-elemento/admin" element={<PrivateRoute onExpire={handleExpire}><TipoElementosAdminPage /></PrivateRoute>} />
                <Route path="/extintores/admin" element={<PrivateRoute onExpire={handleExpire}><ExtintoresAdminPage /></PrivateRoute>} />
                <Route path="/sucursales/:id" element={<PrivateRoute onExpire={handleExpire}><SucursalDetailPage /></PrivateRoute>} />
                <Route path="/sucursales/edit/:id" element={<PrivateRoute onExpire={handleExpire}><SucursalFormPage /></PrivateRoute>} />
                <Route path="/centers" element={<PrivateRoute onExpire={handleExpire}><CentersPage /></PrivateRoute>} />
                <Route path="/centers/nuevo" element={<PrivateRoute onExpire={handleExpire}><CenterFormPage /></PrivateRoute>} />
                <Route path="/centers/:id" element={<PrivateRoute onExpire={handleExpire}><CenterDetailPage /></PrivateRoute>} />
                <Route path="/centers/:id/editar" element={<PrivateRoute onExpire={handleExpire}><CenterFormPage /></PrivateRoute>} />
                <Route path="/tipos-elemento" element={<PrivateRoute onExpire={handleExpire}><TipoElementosPage /></PrivateRoute>} />
                <Route path="/tipos-elemento/nuevo" element={<PrivateRoute onExpire={handleExpire}><TipoElementoFormPage /></PrivateRoute>} />
                <Route path="/tipos-elemento/:id" element={<PrivateRoute onExpire={handleExpire}><TipoElementoDetailPage /></PrivateRoute>} />
                <Route path="/tipos-elemento/:id/editar" element={<PrivateRoute onExpire={handleExpire}><TipoElementoFormPage /></PrivateRoute>} />
                
                {/* Checklists */}
                <Route path="/checklists" element={<PrivateRoute onExpire={handleExpire}><CheckListsPage /></PrivateRoute>} />
                <Route path="/checklists/nuevo" element={<PrivateRoute onExpire={handleExpire}><CheckListFormPage /></PrivateRoute>} />
                <Route path="/checklists/:id" element={<PrivateRoute onExpire={handleExpire}><CheckListDetailPage /></PrivateRoute>} />
                <Route path="/checklists/:id/editar" element={<PrivateRoute onExpire={handleExpire}><CheckListFormPage /></PrivateRoute>} />
                
                {/* Presupuestos */}
                <Route path="/presupuestos" element={<PrivateRoute onExpire={handleExpire}><PresupuestosPage /></PrivateRoute>} />
                <Route path="/presupuestos/nuevo" element={<PrivateRoute onExpire={handleExpire}><PresupuestoFormPage /></PrivateRoute>} />
                <Route path="/presupuestos/:id" element={<PrivateRoute onExpire={handleExpire}><PresupuestoDetailPage /></PrivateRoute>} />
                <Route path="/presupuestos/:id/editar" element={<PrivateRoute onExpire={handleExpire}><PresupuestoFormPage /></PrivateRoute>} />
                
                {/* Asignación de Remitos */}
                <Route path="/remito-usuarios" element={<PrivateRoute onExpire={handleExpire}><RemitoUsuariosPage /></PrivateRoute>} />
                <Route path="/remito-usuarios/nuevo" element={<PrivateRoute onExpire={handleExpire}><RemitoUsuarioFormPage /></PrivateRoute>} />
                <Route path="/remito-usuarios/:id" element={<PrivateRoute onExpire={handleExpire}><RemitoUsuarioDetailPage /></PrivateRoute>} />
                <Route path="/remito-usuarios/:id/editar" element={<PrivateRoute onExpire={handleExpire}><RemitoUsuarioFormPage /></PrivateRoute>} />
                <Route path="/remitos" element={<PrivateRoute onExpire={handleExpire}><RemitosPage /></PrivateRoute>} />
                <Route path="/remitos/:id" element={<PrivateRoute onExpire={handleExpire}><RemitoDetailPage /></PrivateRoute>} />
                <Route path="/remitos/:id/editar" element={<PrivateRoute onExpire={handleExpire}><RemitoFormPage /></PrivateRoute>} />
                
                {/* Gestión */}
                <Route path="/calendario" element={<PrivateRoute onExpire={handleExpire}><CalendarPage /></PrivateRoute>} />
                <Route path="/tareas" element={<PrivateRoute onExpire={handleExpire}><TareasPage /></PrivateRoute>} />
                <Route path="/tareas/nuevo" element={<PrivateRoute onExpire={handleExpire}><TareaFormPage /></PrivateRoute>} />
                <Route path="/tareas/:id" element={<PrivateRoute onExpire={handleExpire}><TareaDetailPage /></PrivateRoute>} />
                <Route path="/tareas/:id/editar" element={<PrivateRoute onExpire={handleExpire}><TareaFormPage /></PrivateRoute>} />
                <Route path="/solicitudes" element={<PrivateRoute onExpire={handleExpire}><SolicitudesPage /></PrivateRoute>} />
                <Route path="/solicitudes/:id" element={<PrivateRoute onExpire={handleExpire}><SolicitudDetailPage /></PrivateRoute>} />
                <Route path="/relevamientos" element={<PrivateRoute onExpire={handleExpire}><RelevamientosPage /></PrivateRoute>} />
                <Route path="/relevamientos/:id" element={<PrivateRoute onExpire={handleExpire}><RelevamientoDetailPage /></PrivateRoute>} />
                <Route path="/qrs" element={<PrivateRoute onExpire={handleExpire}><QRsPage /></PrivateRoute>} />

                {/* Reportes */}
                <Route
                  path="/reportes/puestos-relevados"
                  element={
                    <PrivateRoute onExpire={handleExpire}>
                      <RequirePermission anyOf={[{ resource: 'reportes.puestos-relevados', action: 'read' }, { resource: 'reportes', action: 'read' }]} >
                        <PuestosRelevadosReportPage />
                      </RequirePermission>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/reportes/elementos-relevados"
                  element={
                    <PrivateRoute onExpire={handleExpire}>
                      <RequirePermission anyOf={[{ resource: 'reportes.elementos-relevados', action: 'read' }, { resource: 'reportes', action: 'read' }]} >
                        <ElementosRelevadosReportPage />
                      </RequirePermission>
                    </PrivateRoute>
                  }
                />
                
                {/* Producción */}
                <Route path="/ordenes-trabajo" element={<PrivateRoute onExpire={handleExpire}><OrdenesTrabajoPage /></PrivateRoute>} />
                <Route path="/ordenes-trabajo/nuevo" element={<PrivateRoute onExpire={handleExpire}><OrdenTrabajoFormPage /></PrivateRoute>} />
                <Route path="/ordenes-trabajo/:id" element={<PrivateRoute onExpire={handleExpire}><OrdenTrabajoDetailPage /></PrivateRoute>} />
                <Route path="/ordenes-trabajo/:id/editar" element={<PrivateRoute onExpire={handleExpire}><OrdenTrabajoFormPage /></PrivateRoute>} />
                
                {/* Productos */}
                <Route path="/extintores" element={<PrivateRoute onExpire={handleExpire}><ExtintoresPage /></PrivateRoute>} />
                <Route path="/extintores/nuevo" element={<PrivateRoute onExpire={handleExpire}><ExtintorFormPage /></PrivateRoute>} />
                <Route path="/extintores/:id" element={<PrivateRoute onExpire={handleExpire}><ExtintorDetailPage /></PrivateRoute>} />
                <Route path="/extintores/:id/editar" element={<PrivateRoute onExpire={handleExpire}><ExtintorFormPage /></PrivateRoute>} />
                
                <Route path="/elementos" element={<PrivateRoute onExpire={handleExpire}><ElementosPage /></PrivateRoute>} />
                <Route path="/elementos/nuevo" element={<PrivateRoute onExpire={handleExpire}><ElementoFormPage /></PrivateRoute>} />
                <Route path="/elementos/:id" element={<PrivateRoute onExpire={handleExpire}><ElementoDetailPage /></PrivateRoute>} />
                <Route path="/elementos/:id/editar" element={<PrivateRoute onExpire={handleExpire}><ElementoFormPage /></PrivateRoute>} />
                
                <Route path="/puestos" element={<PrivateRoute onExpire={handleExpire}><PuestosPage /></PrivateRoute>} />
                <Route path="/puestos/nuevo" element={<PrivateRoute onExpire={handleExpire}><PuestoFormPage /></PrivateRoute>} />
                <Route path="/puestos/:id" element={<PrivateRoute onExpire={handleExpire}><PuestoDetailPage /></PrivateRoute>} />
                <Route path="/puestos/:id/editar" element={<PrivateRoute onExpire={handleExpire}><PuestoFormPage /></PrivateRoute>} />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
        
            {/* Notification */}
            <Notification
              message={notification?.message || ''}
              type={notification?.type}
              onClose={() => setNotification(null)}
            />
          </div>
        )}
          </Router>
        </PermissionsProvider>
      </CenterProvider>
    </AuthProvider>
  );
}

export default App;
