import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  UserGroupIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useRoles, usePermissions, useUsers } from '../hooks/useSecurity';
import { Role, User, CreateRoleRequest, securityService } from '../services/securityService';
import DataTable from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const RoleManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const [showCreateFromTemplate, setShowCreateFromTemplate] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Hooks
  const { 
    roles, 
    loading: rolesLoading, 
    error: rolesError, 
    createRole, 
    updateRole, 
    deleteRole, 
    // assignPermissionToRol, 
    // removePermissionFromRol,
    clearError: clearRolesError
  } = useRoles();

  const { 
    permissions, 
    error: permissionsError,
    clearError: clearPermissionsError
  } = usePermissions();

  const { 
    users, 
    error: usersError,
    clearError: clearUsersError
  } = useUsers();

  // const { 
  //   roleTemplates, 
  //   loading: templatesLoading, 
  //   error: templatesError,
  //   createRolFromTemplate,
  //   clearError: clearTemplatesError
  // } = useRolTemplates(); // Temporalmente deshabilitado

  // Estados para formularios
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateRoleRequest>>({
    name: '',
    description: '',
    isSystem: false,
    priority: 0
  });

  // const [// selectedTemplate, // setSelectedTemplate] = useState<RolTemplate | null>(null); // Temporalmente deshabilitado
  const [usersWithSelectedRole, setUsersWithSelectedRole] = useState<User[]>([]);

  // Cargar usuarios con el rol seleccionado
  useEffect(() => {
    if (selectedRole) {
      const usersWithRole = users.filter(user => 
        user.role && user.role.id === selectedRole.id
      );
      setUsersWithSelectedRole(usersWithRole);
    }
  }, [selectedRole, users]);

  const handleCreateRole = async () => {
    try {
      if (!formData.name || !formData.description) {
        setNotification({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
        return;
      }

      const role = await createRole(formData as CreateRoleRequest);
      if (role) {
        setNotification({ type: 'success', message: 'Rol creado exitosamente' });
        setIsCreating(false);
        setFormData({ name: '', description: '', isSystem: false, priority: 0 });
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al crear rol' });
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (!selectedRole || !formData.name || !formData.description) {
        setNotification({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
        return;
      }

      const permissionIds = formData.permissionIds || [];
      console.log('=== ACTUALIZANDO ROL ===');
      console.log('Role ID:', selectedRole.id);
      console.log('PermissionIds a enviar:', permissionIds);
      console.log('FormData completo:', formData);

      const updateData: Partial<CreateRoleRequest> = {
        name: formData.name,
        description: formData.description,
        isSystem: formData.isSystem,
        priority: formData.priority,
        permissionIds: permissionIds // Incluir los permisos seleccionados
      };

      console.log('UpdateData a enviar:', updateData);
      const role = await updateRole({ id: selectedRole.id, ...updateData });
      console.log('Rol actualizado:', role);
      if (role) {
        setNotification({ type: 'success', message: 'Rol actualizado exitosamente' });
        setIsEditing(false);
        setSelectedRole(role);
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al actualizar rol' });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el rol "${role.name}"?`)) return;
    
    try {
      const success = await deleteRole(role.id);
      if (success) {
        setNotification({ type: 'success', message: 'Rol eliminado exitosamente' });
        if (selectedRole?.id === role.id) {
          setSelectedRole(null);
          setShowRoleDetails(false);
        }
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al eliminar rol' });
    }
  };

  // const handleAssignPermission = async (rolId: number, permisoId: number) => {
  //   try {
  //     const success = await assignPermissionToRol(rolId, permisoId);
  //     if (success) {
  //       setNotification({ type: 'success', message: 'Permission asignado exitosamente' });
  //       // Recargar el rol seleccionado
  //       if (selectedRol?.id === rolId) {
  //         const updatedRol = roles.find(r => r.id === rolId);
  //         if (updatedRol) {
  //           setSelectedRol(updatedRol);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     setNotification({ type: 'error', message: 'Error al asignar permiso' });
  //   }
  // }; // Temporalmente deshabilitado

  // const handleRemovePermission = async (rolId: number, permisoId: number) => {
  //   try {
  //     const success = await removePermissionFromRol(rolId, permisoId);
  //     if (success) {
  //       setNotification({ type: 'success', message: 'Permission removido exitosamente' });
  //       // Recargar el rol seleccionado
  //       if (selectedRol?.id === rolId) {
  //         const updatedRol = roles.find(r => r.id === rolId);
  //         if (updatedRol) {
  //           setSelectedRol(updatedRol);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     setNotification({ type: 'error', message: 'Error al remover permiso' });
  //   }
  // }; // Temporalmente deshabilitado

  // const handleCreateFromTemplate = async () => {
  //   try {
  //     if (!// selectedTemplate || !formData.nombre || !formData.descripcion) {
  //       setNotification({ type: 'error', message: 'Por favor selecciona una plantilla y completa los campos' });
  //       return;
  //     }

  //     const role = await createRolFromTemplate(// selectedTemplate.id, {
  //       nombre: formData.nombre,
  //       descripcion: formData.descripcion
  //     });

  //     if (role) {
  //       setNotification({ type: 'success', message: 'Rol creado desde plantilla exitosamente' });
  //       setShowCreateFromTemplate(false);
  //       // setSelectedTemplate(null);
  //       setFormData({ nombre: '', descripcion: '', permisoIds: [] });
  //     }
  //   } catch (error) {
  //     setNotification({ type: 'error', message: 'Error al crear rol desde plantilla' });
  //   }
  // }; // Temporalmente deshabilitado

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleDetails(true);
  };

  const handleEditRole = async (role: Role) => {
    setSelectedRole(role);
    
    // Cargar el rol completo con permisos desde el backend
    try {
      const fullRole = await securityService.getRole(role.id);
      console.log('=== ROL CARGADO DESDE BACKEND ===');
      console.log('Full Role:', fullRole);
      console.log('RolePermissions:', (fullRole as any)?.rolePermissions);
      console.log('Permissions:', fullRole?.permissions);
      
      if (fullRole) {
        // Extraer los IDs de los permisos del rol
        // El backend devuelve RolePermissions (colección de RolePermission)
        let permissionIds: number[] = [];
        
        const roleData = fullRole as any; // Usar any para acceder a propiedades dinámicas
        
        if (roleData.rolePermissions && Array.isArray(roleData.rolePermissions)) {
          console.log('Procesando rolePermissions:', roleData.rolePermissions.length);
          // Si viene en rolePermissions, extraer los permissionId
          // Solo incluir los que están activos
          permissionIds = roleData.rolePermissions
            .filter((rp: any) => rp.activo !== false && rp.activo !== undefined) // Solo activos
            .map((rp: any) => {
              // Puede venir como permissionId o permission.id
              const pid = rp.permissionId || rp.permissionId || rp.permission?.id;
              console.log('RolePermission:', rp, 'PermissionId:', pid);
              return pid;
            })
            .filter((id: any) => id != null && id !== undefined);
          console.log('PermissionIds extraídos:', permissionIds);
        } else if (fullRole.permissions && Array.isArray(fullRole.permissions)) {
          console.log('Procesando permissions:', fullRole.permissions.length);
          // Si viene en permissions, extraer los id directamente
          permissionIds = fullRole.permissions
            .map((p: any) => p.id)
            .filter((id: any) => id != null);
        }
        
        console.log('PermissionIds finales:', permissionIds);
        
        setFormData({
          name: fullRole.name || role.name,
          description: fullRole.description || role.description,
          isSystem: fullRole.isSystem ?? role.isSystem,
          priority: fullRole.priority ?? role.priority,
          permissionIds: permissionIds
        });
      } else {
        console.log('No se pudo cargar el rol completo');
        // Si no se puede cargar, usar los datos básicos sin permisos
        setFormData({
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          priority: role.priority,
          permissionIds: []
        });
      }
    } catch (error) {
      console.error('Error cargando permisos del rol:', error);
      // Si hay error, usar los datos básicos sin permisos
      setFormData({
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        priority: role.priority,
        permissionIds: []
      });
    }
    
    setIsEditing(true);
  };

  const handleNewRole = () => {
    setSelectedRole(null);
    setFormData({ name: '', description: '', isSystem: false, priority: 0 });
    setIsCreating(true);
  };

  const columns = [
    {
      key: 'activo',
      label: 'Activo',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value !== false
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value !== false ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
          <DocumentTextIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
          {value}
        </div>
      ),
    },
    {
      key: 'permissions',
      label: 'Permissions',
      sortable: false,
      render: (value: any, row: Role) => (
        <div className="flex flex-wrap gap-1">
          {row.permissions?.slice(0, 2).map((permission) => (
            <span
              key={permission.id}
              className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/20 dark:text-purple-400"
            >
              {permission.name}
            </span>
          ))}
          {row.permissions && row.permissions.length > 2 && (
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
              +{row.permissions.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'users',
      label: 'Usuarios',
      sortable: false,
      render: (value: any, row: Role) => {
        const usersWithRole = users.filter(user => 
          user.role && user.role.id === row.id
        );
        return (
          <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
            <UserGroupIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
            {usersWithRole.length} usuario{usersWithRole.length !== 1 ? 's' : ''}
          </div>
        );
      },
    },
  ];

  const renderRoleCard = (role: Role) => {
    const usersWithRole = users.filter(user => 
      user.role && user.role.id === role.id
    );

    return (
      <motion.div
        key={role.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-12 w-12">
              <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                {role.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {role.description}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  role.activo !== false
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {role.activo !== false ? 'Activo' : 'Inactivo'}
                </span>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                  {usersWithRole.length} usuario{usersWithRole.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewRole(role)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleEditRole(role)}
              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
              title="Editar"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleDeleteRole(role)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Eliminar"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {role.permissions && role.permissions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions:</h4>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 3).map((permission) => (
                <span
                  key={permission.id}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/20 dark:text-purple-400"
                >
                  {permission.name}
                </span>
              ))}
              {role.permissions.length > 3 && (
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  +{role.permissions.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Roles</h1>
          <p className="text-gray-600 dark:text-gray-400">Administra roles, permisos y plantillas de forma integrada</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={() => setShowCreateFromTemplate(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Desde Plantilla
          </button>
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
      {(rolesError || permissionsError || usersError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error al cargar datos
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {rolesError && <p>Roles: {rolesError}</p>}
                {permissionsError && <p>Permissions: {permissionsError}</p>}
                {usersError && <p>Usuarios: {usersError}</p>}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    clearRolesError();
                    clearPermissionsError();
                    clearUsersError();
                  }}
                  className="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'table' ? (
        <DataTable
          data={roles}
          columns={columns}
          title="Lista de Roles"
          onAdd={handleNewRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
          onView={handleViewRole}
          searchPlaceholder="Buscar roles por nombre, descripción o permisos..."
          itemsPerPage={10}
          actions={[
            {
              label: 'Ver',
              icon: EyeIcon,
              onClick: handleViewRole,
              className: 'text-gray-400 hover:text-blue-500'
            },
            {
              label: 'Editar',
              icon: PencilIcon,
              onClick: handleEditRole,
              className: 'text-gray-400 hover:text-yellow-500'
            },
            {
              label: 'Eliminar',
              icon: TrashIcon,
              onClick: handleDeleteRole,
              className: 'text-gray-400 hover:text-red-500'
            }
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roles.map(renderRoleCard)}
        </div>
      )}

      {/* Role Details Modal */}
      {showRoleDetails && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Detalles del Rol
                </h3>
                <button
                  onClick={() => setShowRoleDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    <div className="h-16 w-16 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <ShieldCheckIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {selectedRole.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedRole.description}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedRole.activo !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {selectedRole.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissions Asignados:</h5>
                    <button
                      onClick={() => {}}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Gestionar Permissions
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedRole.permissions?.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {permission.name}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {permission.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {permission.module}
                            </span>
                            <button
                              onClick={() => {/* handleRemovePermission(selectedRole.id, permission.id) */}}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Remover permiso"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Usuarios con este rol */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuarios con este Rol:</h5>
                    <button
                      onClick={() => {}}
                      className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Ver Todos
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="space-y-1">
                      {usersWithSelectedRole.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                              <UserGroupIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {user.alias}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {user.mail}
                          </span>
                        </div>
                      ))}
                      {usersWithSelectedRole.length > 5 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
                          +{usersWithSelectedRole.length - 5} más...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowRoleDetails(false);
                      handleEditRole(selectedRole);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowRoleDetails(false)}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {isCreating ? 'Crear Rol' : 'Editar Rol'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setFormData({ name: '', description: '', isSystem: false, priority: 0 });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Rol *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Ingresa el nombre del rol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Ingresa la descripción del rol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Permissions
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                    {permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissionIds?.includes(permission.id) || false}
                          onChange={(e) => {
                            const permissionIds = formData.permissionIds || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, permissionIds: [...permissionIds, permission.id] });
                            } else {
                              setFormData({ ...formData, permissionIds: permissionIds.filter(id => id !== permission.id) });
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="ml-2 flex-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {permission.name}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {permission.description} - {permission.module}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                      setFormData({ name: '', description: '', isSystem: false, priority: 0 });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={isCreating ? handleCreateRole : handleUpdateRole}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    {isCreating ? 'Crear' : 'Actualizar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create from Template Modal */}
      {showCreateFromTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Crear Rol desde Plantilla
                </h3>
                <button
                  onClick={() => {
                    setShowCreateFromTemplate(false);
                    // setSelectedTemplate(null);
                    setFormData({ name: '', description: '', isSystem: false, priority: 0 });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seleccionar Plantilla *
                  </label>
                  <select
                    value={''}
                    onChange={(e) => {
                      // const template = roleTemplates.find(t => t.id === parseInt(e.target.value));
                      // setSelectedTemplate(template || null);
                      // if (template) {
                      //   setFormData({
                      //     nombre: '',
                      //     descripcion: '',
                      //     permisoIds: []
                      //   });
                      // }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Selecciona una plantilla...</option>
                    {/* roleTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.nombre} - {template.descripcion}
                      </option>
                    )) */}
                  </select>
                </div>

                {/* Template creation form temporarily disabled */}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateFromTemplate(false);
                      // setSelectedTemplate(null);
                      setFormData({ name: '', description: '', isSystem: false, priority: 0 });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {}} // handleCreateFromTemplate
                    disabled={true /* !selectedTemplate || !formData.nombre || !formData.descripcion */}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Crear desde Plantilla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;
