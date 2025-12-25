import React, { useState, useEffect } from 'react';
import { 
  ComputerDesktopIcon, 
  UserGroupIcon, 
  ShieldCheckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import appAccessService, { App, UserAppAccess, RoleAppAccess, CreateUserAppAccessRequest, CreateRoleAppAccessRequest } from '../services/appAccessService';
import { Role, securityService } from '../services/securityService';
import DataTable, { FilterConfig } from '../components/DataTable';
import Notification from '../components/Notification';
import PermissionGuard from '../components/PermissionGuard';
import { useUsers } from '../hooks/useSecurity';

const AppAccessPage: React.FC = () => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Por defecto, la gestión principal es por rol
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('roles');
  const [apps, setApps] = useState<App[]>([]);
  const [userAppAccesses, setUserAppAccesses] = useState<UserAppAccess[]>([]);
  const [roleAppAccesses, setRoleAppAccesses] = useState<RoleAppAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'user' | 'role'>('user');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [selectedUserForModal, setSelectedUserForModal] = useState<number | null>(null);
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<number | null>(null);
  const [accessLevel, setAccessLevel] = useState('limited');
  const [expiresAt, setExpiresAt] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const { users, loading: usersLoading, error: usersError } = useUsers();

  useEffect(() => {
    loadData();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      const rolesData = await securityService.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      setNotification({ type: 'error', message: 'Error al cargar roles' });
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const appsData = await appAccessService.getAvailableApps();
      setApps(appsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setNotification({ type: 'error', message: 'Error al cargar aplicaciones' });
    } finally {
      setLoading(false);
    }
  };

  const loadUserAppAccesses = async (userId: number) => {
    try {
      const accesses = await appAccessService.getUserAppAccesses(userId);
      setUserAppAccesses(accesses);
    } catch (error) {
      console.error('Error loading user app accesses:', error);
      setNotification({ type: 'error', message: 'Error al cargar accesos del usuario' });
    }
  };

  const loadRoleAppAccesses = async (roleId: number) => {
    try {
      const accesses = await appAccessService.getRoleAppAccesses(roleId);
      setRoleAppAccesses(accesses);
    } catch (error) {
      console.error('Error loading role app accesses:', error);
      setNotification({ type: 'error', message: 'Error al cargar accesos del rol' });
    }
  };

  const handleDelete = async (access: UserAppAccess | RoleAppAccess) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este acceso?')) return;
    
    try {
      if ('userId' in access) {
        await appAccessService.deleteUserAppAccess(access.id);
        setNotification({ type: 'success', message: 'Acceso de usuario eliminado exitosamente' });
      } else {
        await appAccessService.deleteRoleAppAccess(access.id);
        setNotification({ type: 'success', message: 'Acceso de rol eliminado exitosamente' });
      }
      loadData();
      
      // Recargar accesos específicos si hay un usuario o rol seleccionado
      if (selectedUser) {
        loadUserAppAccesses(selectedUser);
      }
      if (selectedRole) {
        loadRoleAppAccesses(selectedRole);
      }
    } catch (error: any) {
      console.error('Error deleting access:', error);
      
      const errorMessage = error.message || '';
      const accessType = 'userId' in access ? 'usuario' : 'rol';
      
      if (errorMessage.includes('404') || errorMessage.includes('no encontrado')) {
        setNotification({ 
          type: 'error', 
          message: `El acceso de ${accessType} no fue encontrado` 
        });
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setNotification({ 
          type: 'error', 
          message: 'No tienes permisos para eliminar este acceso' 
        });
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        setNotification({ 
          type: 'error', 
          message: 'Error interno del servidor. Por favor intenta nuevamente' 
        });
      } else {
        setNotification({ 
          type: 'error', 
          message: `Error al eliminar acceso de ${accessType}. Por favor intenta nuevamente` 
        });
      }
    }
  };

  const handleView = (access: UserAppAccess | RoleAppAccess) => {
    // Abrir modal de vista
    setEditingAccess(access);
    setAccessModalMode('view');
    setShowAccessModal(true);
  };

  const handleEdit = (access: UserAppAccess | RoleAppAccess) => {
    // Abrir modal de edición
    setEditingAccess(access);
    setAccessModalMode('edit');
    setShowAccessModal(true);
  };

  // Modal de ver/editar accesos existentes (no es el modal de "crear")
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessModalMode, setAccessModalMode] = useState<'view' | 'edit'>('view');
  const [editingAccess, setEditingAccess] = useState<UserAppAccess | RoleAppAccess | null>(null);

  useEffect(() => {
    if (!showAccessModal || !editingAccess) return;
    // Precargar campos para edición
    setAccessLevel(editingAccess.accessLevel || 'limited');
    setExpiresAt(editingAccess.expiresAt ? editingAccess.expiresAt.slice(0, 16) : '');
    // selectedApp se usa para "crear"; para editar lo mantenemos como referencia
    setSelectedApp(editingAccess.appId);
  }, [showAccessModal, editingAccess]);

  const handleSaveEditAccess = async () => {
    if (!editingAccess) return;
    try {
      const payload = {
        accessLevel,
        expiresAt: expiresAt || undefined,
      };

      if ('userId' in editingAccess) {
        await appAccessService.updateUserAppAccess(editingAccess.id, payload);
        setNotification({ type: 'success', message: 'Acceso de usuario actualizado exitosamente' });
        if (selectedUser) await loadUserAppAccesses(selectedUser);
      } else {
        await appAccessService.updateRoleAppAccess(editingAccess.id, payload);
        setNotification({ type: 'success', message: 'Acceso de rol actualizado exitosamente' });
        if (selectedRole) await loadRoleAppAccesses(selectedRole);
      }
      setShowAccessModal(false);
      setEditingAccess(null);
    } catch (error) {
      console.error('Error updating access:', error);
      setNotification({ type: 'error', message: 'Error al actualizar acceso' });
    }
  };

  const selectUser = async (userId: number) => {
    setSelectedUser(userId);
    await loadUserAppAccesses(userId);
  };

  const selectRole = async (roleId: number) => {
    setSelectedRole(roleId);
    await loadRoleAppAccesses(roleId);
  };

  const handleNewUserAccess = (userId?: number) => {
    setModalType('user');
    setShowModal(true);
    resetModal();
    if (userId) {
      setSelectedUserForModal(userId);
    }
  };

  const handleNewRoleAccess = (roleId?: number) => {
    setModalType('role');
    setShowModal(true);
    resetModal();
    if (roleId) {
      setSelectedRoleForModal(roleId);
    }
  };

  // Configuración de filtros para accesos de usuarios
  const userAccessFilterConfig: FilterConfig[] = [
    {
      key: 'appName',
      label: 'Aplicación',
      type: 'text',
      placeholder: 'Filtrar por aplicación...'
    },
    {
      key: 'accessLevel',
      label: 'Nivel de Acceso',
      type: 'select',
      options: [
        { value: 'full', label: 'Completo' },
        { value: 'limited', label: 'Limitado' },
        { value: 'readonly', label: 'Solo Lectura' }
      ]
    },
    {
      key: 'expiresAt',
      label: 'Expira',
      type: 'boolean'
    }
  ];

  // Configuración de columnas para accesos de usuarios
  // Funciones de acción con validación de permisos
  const handleViewWithPermission = (row: UserAppAccess) => {
    // Ver siempre está permitido para usuarios autenticados
    handleView(row);
  };

  const handleEditWithPermission = (row: UserAppAccess) => {
    // Verificar permiso de edición
    handleEdit(row);
  };

  const handleDeleteWithPermission = (row: UserAppAccess) => {
    // Verificar permiso de eliminación
    handleDelete(row);
  };

  const userAccessColumns = [
    {
      key: 'appName',
      label: 'Aplicación',
      sortable: true,
      render: (value: string, row: UserAppAccess) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <ComputerDesktopIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.appCode}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'accessLevel',
      label: 'Nivel de Acceso',
      sortable: true,
      render: (value: string) => {
        const levelMap: { [key: string]: { label: string; className: string } } = {
          'full': { label: 'Completo', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
          'limited': { label: 'Limitado', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
          'readonly': { label: 'Solo Lectura', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' }
        };
        const level = levelMap[value] || { label: value, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${level.className}`}>
            {level.label}
          </span>
        );
      },
    },
    {
      key: 'expiresAt',
      label: 'Expira',
      sortable: true,
      render: (value: string | null) => {
        if (!value) {
          return (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
              Nunca
            </span>
          );
        }
        
        const expiresDate = new Date(value);
        const now = new Date();
        const isExpired = expiresDate < now;
        const isExpiringSoon = expiresDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            isExpired 
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              : isExpiringSoon
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          }`}>
            {expiresDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Creado',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Configuración de filtros para accesos de roles
  const roleAccessFilterConfig: FilterConfig[] = [
    {
      key: 'appName',
      label: 'Aplicación',
      type: 'text',
      placeholder: 'Filtrar por aplicación...'
    },
    {
      key: 'accessLevel',
      label: 'Nivel de Acceso',
      type: 'select',
      options: [
        { value: 'full', label: 'Completo' },
        { value: 'limited', label: 'Limitado' },
        { value: 'readonly', label: 'Solo Lectura' }
      ]
    },
    {
      key: 'expiresAt',
      label: 'Expira',
      type: 'boolean'
    }
  ];

  // Configuración de columnas para accesos de roles
  const roleAccessColumns = [
    {
      key: 'appName',
      label: 'Aplicación',
      sortable: true,
      render: (value: string, row: RoleAppAccess) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <ComputerDesktopIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.appCode}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'accessLevel',
      label: 'Nivel de Acceso',
      sortable: true,
      render: (value: string) => {
        const colors = {
          full: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          limited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          readonly: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        };
        const labels = {
          full: 'Completo',
          limited: 'Limitado',
          readonly: 'Solo Lectura'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || colors.readonly}`}>
            {labels[value as keyof typeof labels] || value}
          </span>
        );
      },
    },
    {
      key: 'expiresAt',
      label: 'Expira',
      sortable: true,
      render: (value: string | null) => {
        if (!value) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
              Nunca
            </span>
          );
        }
        const expiresDate = new Date(value);
        const isExpired = expiresDate < new Date();
        return (
          <span className={`text-sm ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {expiresDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Creado',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
  ];

  // Listados (layout estándar con DataTable)
  const userListColumns = [
    {
      key: 'nombreCompleto',
      label: 'Usuario',
      sortable: true,
      render: (_: any, row: any) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="ml-4 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {row.nombreCompleto || `${row.apellido || ''} ${row.nombre || ''}`.trim() || row.alias || 'Usuario'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {row.mail || row.email || ''}
            </div>
          </div>
        </div>
      )
    },
    { key: 'alias', label: 'Alias', sortable: true, render: (v: string) => <span className="text-sm text-gray-700 dark:text-gray-200">{v || '-'}</span> },
    { key: 'roleId', label: 'Rol', sortable: true, render: (_: any, row: any) => <span className="text-sm text-gray-700 dark:text-gray-200">{row.role?.name || row.role?.Name || row.roleName || row.roleId}</span> },
  ];

  const roleListColumns = [
    {
      key: 'name',
      label: 'Rol',
      sortable: true,
      render: (value: string, row: Role) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="ml-4 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {row.description}
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleCreateAccess = async () => {
    if (!selectedApp) {
      setNotification({ type: 'error', message: 'Por favor selecciona una aplicación' });
      return;
    }

    try {
      if (modalType === 'user' && selectedUserForModal) {
        const request: CreateUserAppAccessRequest = {
          userId: selectedUserForModal,
          appId: selectedApp,
          accessLevel,
          expiresAt: expiresAt || undefined
        };
        await appAccessService.createUserAppAccess(request);
        setNotification({ type: 'success', message: 'Acceso de usuario creado exitosamente' });
        // Actualizar la vista si estamos viendo ese usuario
        if (selectedUser === selectedUserForModal) {
          await loadUserAppAccesses(selectedUserForModal);
        }
      } else if (modalType === 'role' && selectedRoleForModal) {
        const request: CreateRoleAppAccessRequest = {
          roleId: selectedRoleForModal,
          appId: selectedApp,
          accessLevel,
          expiresAt: expiresAt || undefined
        };
        await appAccessService.createRoleAppAccess(request);
        setNotification({ type: 'success', message: 'Acceso de rol creado exitosamente' });
      } else {
        setNotification({ type: 'error', message: 'Por favor selecciona un usuario o rol' });
        return;
      }
      
      setShowModal(false);
      resetModal();
      
      // Recargar accesos específicos si hay un usuario o rol seleccionado
      if (selectedUser) {
        loadUserAppAccesses(selectedUser);
      }
      if (selectedRole) {
        loadRoleAppAccesses(selectedRole);
      }
    } catch (error: any) {
      console.error('Error creating access:', error);
      
      // Manejar diferentes tipos de errores
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('409') || errorMessage.includes('ya tiene acceso')) {
        setNotification({ 
          type: 'error', 
          message: modalType === 'user' 
            ? 'Este usuario ya tiene acceso a esta aplicación' 
            : 'Este rol ya tiene acceso a esta aplicación'
        });
      } else if (errorMessage.includes('404') || errorMessage.includes('no encontrado')) {
        setNotification({ 
          type: 'error', 
          message: modalType === 'user' 
            ? 'Usuario o aplicación no encontrado' 
            : 'Rol o aplicación no encontrado'
        });
      } else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        setNotification({ 
          type: 'error', 
          message: 'Datos inválidos. Por favor verifica la información ingresada' 
        });
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        setNotification({ 
          type: 'error', 
          message: 'Error interno del servidor. Por favor intenta nuevamente' 
        });
      } else {
        // Extraer solo el mensaje útil del error, sin códigos de estado
        const cleanMessage = errorMessage
          .replace(/^\d+:\s*/, '') // Remover códigos de estado al inicio
          .replace(/Error al crear acceso de (usuario|rol):\s*\d+\s*-\s*/, '') // Remover prefijos de error
          .trim();
        
        setNotification({ 
          type: 'error', 
          message: cleanMessage || 'Error al crear acceso. Por favor intenta nuevamente' 
        });
      }
    }
  };

  const resetModal = () => {
    setSelectedUserForModal(null);
    setSelectedRoleForModal(null);
    setSelectedApp(null);
    setAccessLevel('limited');
    setExpiresAt('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Acceso a Aplicaciones</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona los accesos de usuarios y roles a las aplicaciones</p>
        </div>
        <div className="flex items-center space-x-4">
          <PermissionGuard adminOnly={true}>
            <button
              onClick={() => handleNewUserAccess()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Acceso de Usuario
            </button>
          </PermissionGuard>
          <PermissionGuard adminOnly={true}>
            <button
              onClick={() => handleNewRoleAccess()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Acceso de Rol
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Error Messages */}
      {usersError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error al cargar usuarios
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {usersError}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
            Accesos por Rol
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <UserGroupIcon className="h-5 w-5 inline mr-2" />
            Accesos por Usuario
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <DataTable
                data={users}
                columns={userListColumns}
                title="Usuarios"
                searchPlaceholder="Buscar usuarios..."
                itemsPerPage={10}
                loading={usersLoading}
                emptyMessage="No hay usuarios disponibles"
                actions={[
                  {
                    label: 'Ver',
                    icon: EyeIcon,
                    onClick: (row: any) => selectUser(row.id),
                    className: 'text-gray-400 hover:text-blue-500'
                  },
                  {
                    label: 'Editar accesos',
                    icon: PencilIcon,
                    onClick: (row: any) => {
                      selectUser(row.id);
                      handleNewUserAccess(row.id);
                    },
                    className: 'text-gray-400 hover:text-yellow-500'
                  }
                ]}
              />
            </div>
          </div>

          {/* User App Accesses */}
          {selectedUser && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Accesos del Usuario
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Gestiona los accesos a aplicaciones para este usuario
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {userAppAccesses.length > 0 ? (
                  <DataTable
                    data={userAppAccesses}
                    columns={userAccessColumns}
                    title=""
                    onAdd={() => handleNewUserAccess(selectedUser)}
                    onEdit={handleEditWithPermission}
                    onDelete={handleDeleteWithPermission}
                    onView={handleViewWithPermission}
                    searchPlaceholder="Buscar accesos..."
                    itemsPerPage={10}
                    actions={[
                      {
                        label: 'Ver',
                        icon: EyeIcon,
                        onClick: handleViewWithPermission,
                        className: 'text-gray-400 hover:text-blue-500'
                      },
                      {
                        label: 'Editar',
                        icon: PencilIcon,
                        onClick: handleEditWithPermission,
                        className: 'text-gray-400 hover:text-yellow-500'
                      },
                      {
                        label: 'Eliminar',
                        icon: TrashIcon,
                        onClick: handleDeleteWithPermission,
                        className: 'text-gray-400 hover:text-red-500'
                      }
                    ]}
                    filters={userAccessFilterConfig}
                    enableAdvancedFilters={true}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ComputerDesktopIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No hay accesos asignados
                    </h3>
                    <p className="mb-4">Este usuario no tiene accesos a aplicaciones asignados.</p>
                    <button
                      onClick={() => handleNewUserAccess(selectedUser)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Asignar Primer Acceso
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <DataTable
                data={roles}
                columns={roleListColumns}
                title="Roles"
                searchPlaceholder="Buscar roles..."
                itemsPerPage={10}
                loading={loadingRoles}
                emptyMessage="No hay roles disponibles"
                actions={[
                  {
                    label: 'Ver',
                    icon: EyeIcon,
                    onClick: (row: Role) => selectRole(row.id),
                    className: 'text-gray-400 hover:text-blue-500'
                  },
                  {
                    label: 'Editar accesos',
                    icon: PencilIcon,
                    onClick: (row: Role) => {
                      selectRole(row.id);
                      handleNewRoleAccess(row.id);
                    },
                    className: 'text-gray-400 hover:text-yellow-500'
                  }
                ]}
              />
            </div>
          </div>

          {/* Role App Accesses */}
          {selectedRole && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Accesos del Rol
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Gestiona los accesos a aplicaciones para este rol
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {roleAppAccesses.length > 0 ? (
                  <DataTable
                    data={roleAppAccesses}
                    columns={roleAccessColumns}
                    title=""
                    onAdd={() => handleNewRoleAccess(selectedRole)}
                    onEdit={handleEditWithPermission}
                    onDelete={handleDeleteWithPermission}
                    onView={handleViewWithPermission}
                    searchPlaceholder="Buscar accesos..."
                    itemsPerPage={10}
                    actions={[
                      {
                        label: 'Ver',
                        icon: EyeIcon,
                        onClick: handleViewWithPermission,
                        className: 'text-gray-400 hover:text-blue-500'
                      },
                      {
                        label: 'Editar',
                        icon: PencilIcon,
                        onClick: handleEditWithPermission,
                        className: 'text-gray-400 hover:text-yellow-500'
                      },
                      {
                        label: 'Eliminar',
                        icon: TrashIcon,
                        onClick: handleDeleteWithPermission,
                        className: 'text-gray-400 hover:text-red-500'
                      }
                    ]}
                    filters={roleAccessFilterConfig}
                    enableAdvancedFilters={true}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ComputerDesktopIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No hay accesos asignados
                    </h3>
                    <p className="mb-4">Este rol no tiene accesos a aplicaciones asignados.</p>
                    <button
                      onClick={() => handleNewRoleAccess(selectedRole)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Asignar Primer Acceso
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {modalType === 'user' ? 'Asignar Aplicación a Usuario' : 'Asignar Aplicación a Rol'}
            </h2>
            
            <div className="space-y-4">
              {modalType === 'user' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usuario
                  </label>
                  <select
                    value={selectedUserForModal || ''}
                    onChange={(e) => setSelectedUserForModal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Seleccionar usuario</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.nombreCompleto || user.alias} ({user.mail})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol
                  </label>
                  <select
                    value={selectedRoleForModal || ''}
                    onChange={(e) => setSelectedRoleForModal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={loadingRoles}
                  >
                    <option value="">{loadingRoles ? 'Cargando roles...' : 'Seleccionar rol'}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Aplicación
                </label>
                <select
                  value={selectedApp || ''}
                  onChange={(e) => setSelectedApp(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Seleccionar aplicación</option>
                  {apps.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel de Acceso
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="readonly">Solo Lectura</option>
                  <option value="limited">Limitado</option>
                  <option value="full">Completo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Expiración (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAccess}
                disabled={!selectedApp || (modalType === 'user' ? !selectedUserForModal : !selectedRoleForModal)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver/Editar Acceso */}
      {showAccessModal && editingAccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {accessModalMode === 'view' ? 'Detalle de Acceso' : 'Editar Acceso'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aplicación</label>
                <input
                  value={`${editingAccess.appName} (${editingAccess.appCode})`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nivel de Acceso</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  disabled={accessModalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="readonly">Solo Lectura</option>
                  <option value="limited">Limitado</option>
                  <option value="full">Completo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha de Expiración (Opcional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={accessModalMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAccessModal(false);
                  setEditingAccess(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cerrar
              </button>

              {accessModalMode === 'edit' && (
                <button
                  onClick={handleSaveEditAccess}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppAccessPage;
