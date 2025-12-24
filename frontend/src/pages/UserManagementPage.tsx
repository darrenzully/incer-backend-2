import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useUsers, useRoles, usePermissions } from '../hooks/useSecurity';
import { User, CreateUserRequest, UpdateUserRequest, securityService } from '../services/securityService';
import { clienteService, Center } from '../services/clienteService';
import DataTable from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const UserManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [availableCenters, setAvailableCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Hooks
  const { 
    users, 
    loading: usersLoading, 
    error: usersError, 
    createUser, 
    updateUser, 
    deleteUser, 
    // assignRoleToUser, 
    // removeRoleFromUser,
    clearError: clearUsersError
  } = useUsers();

  const { 
    roles, 
    error: rolesError,
    clearError: clearRolesError
  } = useRoles();

  const { 
    permissions,
    error: permissionsError,
    // getEffectivePermissions,
    clearError: clearPermissionsError
  } = usePermissions();

  // Estados para formularios
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateUserRequest>>({
    nombre: '',
    apellido: '',
    mail: '',
    alias: '',
    clave: '',
    roleId: 0
  });
  const [selectedCenters, setSelectedCenters] = useState<number[]>([]);
  const [formAvailableCenters, setFormAvailableCenters] = useState<Center[]>([]);
  const [loadingFormCenters, setLoadingFormCenters] = useState(false);
  const [centerClientsMap, setCenterClientsMap] = useState<Record<number, any[]>>({});
  const [loadingCenterClients, setLoadingCenterClients] = useState<Record<number, boolean>>({});
  const [selectedClients, setSelectedClients] = useState<number[]>([]);

  const [effectivePermissions, setEffectivePermissions] = useState<{
    permisos: any[];
    accesosAplicaciones: any[];
    accesosCentros: any[];
  }>({
    permisos: [],
    accesosAplicaciones: [],
    accesosCentros: []
  });

  // Estados para centros y clientes de usuarios
  const [userCentersMap, setUserCentersMap] = useState<Record<number, any[]>>({});
  const [userClientsMap, setUserClientsMap] = useState<Record<number, any[]>>({});
  const [loadingUserData, setLoadingUserData] = useState<Record<number, boolean>>({});

  // Cargar permisos efectivos cuando se selecciona un usuario
  useEffect(() => {
    if (selectedUser) {
      // loadEffectivePermissions(selectedUser.id);
    }
  }, [selectedUser /* , getEffectivePermissions */]);

  // Cargar centros disponibles cuando se abre el modal
  useEffect(() => {
    if (showCenterModal) {
      loadAvailableCenters();
    }
  }, [showCenterModal]);

  // Cargar centros cuando se abre el formulario de creación/edición
  useEffect(() => {
    if (isCreating || isEditing) {
      loadFormCenters();
      if (isEditing && selectedUser?.id) {
        loadUserCentersForForm(selectedUser.id);
      } else {
        setSelectedCenters([]);
      }
    } else {
      // Limpiar cuando se cierra el formulario
      setSelectedCenters([]);
      setFormAvailableCenters([]);
    }
  }, [isCreating, isEditing, selectedUser?.id]);

  const loadFormCenters = async () => {
    try {
      setLoadingFormCenters(true);
      const centers = await clienteService.getCentros();
      setFormAvailableCenters(centers.filter(c => c.activo));
    } catch (error) {
      console.error('Error cargando centros para formulario:', error);
      setNotification({ type: 'error', message: 'Error al cargar los centros disponibles' });
    } finally {
      setLoadingFormCenters(false);
    }
  };

  const loadUserCentersForForm = async (userId: number) => {
    try {
      const centers = await securityService.getUsuarioCentros(userId);
      const centerIds = centers.map((c: any) => c.id);
      setSelectedCenters(centerIds);
      
      // Cargar clientes de cada centro para mostrarlos en el formulario
      for (const centerId of centerIds) {
        await loadCenterClients(centerId);
      }
      
      // Cargar clientes asignados directamente al usuario (no todos los clientes de los centros)
      const assignedClients = await securityService.getUserAssignedClients(userId);
      setSelectedClients(assignedClients.map((c: any) => c.id));
    } catch (error) {
      console.error('Error cargando centros del usuario:', error);
    }
  };

  const loadAvailableCenters = async () => {
    try {
      setLoadingCenters(true);
      const centers = await clienteService.getCentros();
      setAvailableCenters(centers.filter(c => c.activo));
    } catch (error) {
      console.error('Error cargando centros:', error);
      setNotification({ type: 'error', message: 'Error al cargar los centros disponibles' });
    } finally {
      setLoadingCenters(false);
    }
  };

  // Cargar centros y clientes cuando se cargan los usuarios
  useEffect(() => {
    const loadUsersData = async () => {
      if (!users || users.length === 0) return;

      for (const user of users) {
        if (!userCentersMap[user.id] && !loadingUserData[user.id]) {
          setLoadingUserData(prev => ({ ...prev, [user.id]: true }));
          try {
            const [centers, clients] = await Promise.all([
              securityService.getUsuarioCentros(user.id),
              securityService.getUserAssignedClients(user.id) // Usar clientes asignados directamente, no todos los de los centros
            ]);
            setUserCentersMap(prev => ({ ...prev, [user.id]: centers || [] }));
            setUserClientsMap(prev => ({ ...prev, [user.id]: clients || [] }));
          } catch (error) {
            console.error(`Error cargando datos del usuario ${user.id}:`, error);
          } finally {
            setLoadingUserData(prev => ({ ...prev, [user.id]: false }));
          }
        }
      }
    };

    loadUsersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  // const loadEffectivePermissions = async (usuarioId: number) => {
  //   try {
  //     const perms = await getEffectivePermissions(usuarioId);
  //     setEffectivePermissions(perms);
  //   } catch (error) {
  //     console.error('Error loading effective permissions:', error);
  //   }
  // };

  const handleCreateUser = async () => {
    try {
      if (!formData.nombre || !formData.mail || !formData.clave) {
        setNotification({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
        return;
      }

      const user = await createUser(formData as CreateUserRequest);
      if (user) {
        // Asignar centros seleccionados
        if (selectedCenters.length > 0) {
          try {
            await Promise.all(
              selectedCenters.map(centerId => 
                securityService.assignCenterToUser(user.id, centerId)
              )
            );
          } catch (error) {
            console.error('Error asignando centros:', error);
            setNotification({ type: 'error', message: 'Usuario creado pero hubo un error al asignar algunos centros' });
          }
        }

        // Asignar clientes seleccionados (solo los que el usuario seleccionó explícitamente)
        if (selectedClients.length > 0) {
          try {
            await Promise.all(
              selectedClients.map(clienteId => 
                securityService.assignClientToUser(user.id, clienteId)
              )
            );
          } catch (error) {
            console.error('Error asignando clientes:', error);
            setNotification({ type: 'error', message: 'Usuario creado pero hubo un error al asignar algunos clientes' });
          }
        }

        setNotification({ type: 'success', message: 'Usuario creado exitosamente' });
        setIsCreating(false);
        setFormData({ nombre: '', apellido: '', mail: '', alias: '', clave: '', roleId: 0 });
        setSelectedCenters([]);
        setSelectedClients([]);
        setCenterClientsMap({});
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al crear usuario' });
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser || !formData.nombre || !formData.mail) {
        setNotification({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
        return;
      }

      const updateData: UpdateUserRequest = {
        id: selectedUser.id,
        nombre: formData.nombre,
        apellido: formData.apellido,
        mail: formData.mail,
        alias: formData.alias,
        roleId: formData.roleId
      };

      const user = await updateUser(updateData);
      if (user) {
        // Sincronizar centros: obtener centros actuales y comparar con seleccionados
        try {
          const currentCenters = await securityService.getUsuarioCentros(selectedUser.id);
          const currentCenterIds = currentCenters.map((c: any) => c.id);
          
          // Centros a agregar
          const centersToAdd = selectedCenters.filter(id => !currentCenterIds.includes(id));
          // Centros a remover
          const centersToRemove = currentCenterIds.filter((id: number) => !selectedCenters.includes(id));

          // Agregar nuevos centros
          if (centersToAdd.length > 0) {
            await Promise.all(
              centersToAdd.map(centerId => 
                securityService.assignCenterToUser(selectedUser.id, centerId)
              )
            );
          }

          // Remover centros deseleccionados
          if (centersToRemove.length > 0) {
            await Promise.all(
              centersToRemove.map((centerId: number) => 
                securityService.removeCenterFromUser(selectedUser.id, centerId)
              )
            );
          }

          // Sincronizar clientes: obtener clientes actuales asignados directamente y comparar con seleccionados
          const currentAssignedClients = await securityService.getUserAssignedClients(selectedUser.id);
          const currentClientIds = currentAssignedClients.map((c: any) => c.id);

          // Clientes a agregar
          const clientsToAdd = selectedClients.filter(id => !currentClientIds.includes(id));
          // Clientes a remover
          const clientsToRemove = currentClientIds.filter((id: number) => !selectedClients.includes(id));

          // Agregar nuevos clientes
          if (clientsToAdd.length > 0) {
            await Promise.all(
              clientsToAdd.map(clienteId =>
                securityService.assignClientToUser(selectedUser.id, clienteId)
              )
            );
          }

          // Remover clientes deseleccionados
          if (clientsToRemove.length > 0) {
            await Promise.all(
              clientsToRemove.map((clienteId: number) =>
                securityService.removeClientFromUser(selectedUser.id, clienteId)
              )
            );
          }

          // Recargar datos del usuario
          const updatedCenters = await securityService.getUsuarioCentros(selectedUser.id);
          setUserCentersMap(prev => ({ ...prev, [selectedUser.id]: updatedCenters || [] }));
          
          // Usar los clientes asignados directamente, no todos los clientes de los centros
          const updatedAssignedClients = await securityService.getUserAssignedClients(selectedUser.id);
          setUserClientsMap(prev => ({ ...prev, [selectedUser.id]: updatedAssignedClients || [] }));
        } catch (error: any) {
          console.error('Error sincronizando centros:', error);
          setNotification({ 
            type: 'error', 
            message: `Usuario actualizado pero hubo un error al actualizar los centros: ${error.message || 'Error desconocido'}` 
          });
        }

        setNotification({ type: 'success', message: 'Usuario actualizado exitosamente' });
        setIsEditing(false);
        setSelectedUser(user);
      } else {
        setNotification({ type: 'error', message: 'No se pudo actualizar el usuario' });
      }
    } catch (error: any) {
      console.error('Error en handleUpdateUser:', error);
      setNotification({ 
        type: 'error', 
        message: error.message || 'Error al actualizar usuario' 
      });
    }
  };

  const handleToggleCenter = async (centerId: number) => {
    const isSelected = selectedCenters.includes(centerId);
    
    if (isSelected) {
      // Deseleccionar centro
      setSelectedCenters(prev => prev.filter(id => id !== centerId));
      // Remover clientes de ese centro de la selección
      const clientsToRemove = centerClientsMap[centerId]?.map(c => c.id) || [];
      setSelectedClients(prev => prev.filter(id => !clientsToRemove.includes(id)));
      // Limpiar el mapa de clientes de ese centro
      setCenterClientsMap(prev => {
        const newMap = { ...prev };
        delete newMap[centerId];
        return newMap;
      });
    } else {
      // Seleccionar centro
      setSelectedCenters(prev => [...prev, centerId]);
      // Cargar clientes de ese centro
      await loadCenterClients(centerId);
    }
  };

  const loadCenterClients = async (centerId: number) => {
    if (centerClientsMap[centerId]) {
      return; // Ya están cargados
    }
    
    setLoadingCenterClients(prev => ({ ...prev, [centerId]: true }));
    try {
      const clients = await securityService.getCenterClients(centerId);
      setCenterClientsMap(prev => ({ ...prev, [centerId]: clients }));
    } catch (error) {
      console.error(`Error cargando clientes del centro ${centerId}:`, error);
      setNotification({ type: 'error', message: `Error al cargar clientes del centro` });
    } finally {
      setLoadingCenterClients(prev => ({ ...prev, [centerId]: false }));
    }
  };

  const handleToggleClient = (clienteId: number) => {
    setSelectedClients(prev =>
      prev.includes(clienteId)
        ? prev.filter(id => id !== clienteId)
        : [...prev, clienteId]
    );
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el usuario "${user.alias || user.nombre}"?`)) return;
    
    try {
      const success = await deleteUser(user.id);
      if (success) {
        setNotification({ type: 'success', message: 'Usuario eliminado exitosamente' });
        if (selectedUser?.id === user.id) {
          setSelectedUser(null);
          setShowUserDetails(false);
        }
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al eliminar usuario' });
    }
  };

  // Funciones para asignar/remover roles (para uso futuro)
  // const handleAssignRole = async (usuarioId: number, rolId: number) => {
  //   try {
  //     const success = await assignRoleToUser(usuarioId, rolId);
  //     if (success) {
  //       setNotification({ type: 'success', message: 'Rol asignado exitosamente' });
  //       await loadEffectivePermissions(usuarioId);
  //     }
  //   } catch (error) {
  //     setNotification({ type: 'error', message: 'Error al asignar rol' });
  //   }
  // };

  // const handleRemoveRole = async (usuarioId: number, rolId: number) => {
  //   try {
  //     const success = await removeRoleFromUser(usuarioId, rolId);
  //     if (success) {
  //       setNotification({ type: 'success', message: 'Rol removido exitosamente' });
  //       await loadEffectivePermissions(usuarioId);
  //     }
  //   } catch (error) {
  //     setNotification({ type: 'error', message: 'Error al remover rol' });
  //   }
  // };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleAssignCenter = async (centerId: number) => {
    if (!selectedUser) return;

    try {
      await securityService.assignCenterToUser(selectedUser.id, centerId);
      setNotification({ type: 'success', message: 'Centro asignado correctamente' });
      
      // Recargar centros del usuario
      const centers = await securityService.getUsuarioCentros(selectedUser.id);
      setUserCentersMap(prev => ({ ...prev, [selectedUser.id]: centers || [] }));
      
      // Recargar clientes asignados directamente del usuario
      const clients = await securityService.getUserAssignedClients(selectedUser.id);
      setUserClientsMap(prev => ({ ...prev, [selectedUser.id]: clients || [] }));
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error al asignar centro' });
    }
  };

  const handleRemoveCenter = async (centerId: number) => {
    if (!selectedUser) return;
    if (!window.confirm('¿Estás seguro de que quieres desasignar este centro?')) return;

    try {
      await securityService.removeCenterFromUser(selectedUser.id, centerId);
      setNotification({ type: 'success', message: 'Centro desasignado correctamente' });
      
      // Recargar centros del usuario
      const centers = await securityService.getUsuarioCentros(selectedUser.id);
      setUserCentersMap(prev => ({ ...prev, [selectedUser.id]: centers || [] }));
      
      // Recargar clientes asignados directamente del usuario
      const clients = await securityService.getUserAssignedClients(selectedUser.id);
      setUserClientsMap(prev => ({ ...prev, [selectedUser.id]: clients || [] }));
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message || 'Error al desasignar centro' });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      mail: user.mail || '',
      alias: user.alias || '',
      roleId: user.roleId || 0
    });
    setIsEditing(true);
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setFormData({ nombre: '', apellido: '', mail: '', alias: '', clave: '', roleId: 0 });
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
      key: 'foto',
      label: 'Foto',
      sortable: false,
      render: (value: any, row: User) => (
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      ),
    },
    {
      key: 'alias',
      label: 'Usuario',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: false,
      render: (value: any, row: User) => (
        <div className="flex flex-wrap gap-1">
          {row.role ? (
            <span
              key={row.role.id}
              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400"
            >
              {row.role.name}
            </span>
          ) : null}
          {row.role && (
            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
              +1
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'centers',
      label: 'Centros',
      sortable: false,
      render: (value: any, row: User) => {
        const userCenters = userCentersMap[row.id] || [];
        const isLoading = loadingUserData[row.id];
        return (
          <div className="flex flex-wrap gap-1">
            {isLoading ? (
              <span className="text-xs text-gray-500">Cargando...</span>
            ) : userCenters.length > 0 ? (
              <>
                {userCenters.slice(0, 2).map((center: any) => (
                  <span
                    key={center.id}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400"
                    title={center.nombre}
                  >
                    {center.nombre?.substring(0, 15) || 'Centro'}
                  </span>
                ))}
                {userCenters.length > 2 && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                    +{userCenters.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">Sin centros</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'clients',
      label: 'Clientes',
      sortable: false,
      render: (value: any, row: User) => {
        const userClients = userClientsMap[row.id] || [];
        const isLoading = loadingUserData[row.id];
        return (
          <div className="flex flex-wrap gap-1">
            {isLoading ? (
              <span className="text-xs text-gray-500">Cargando...</span>
            ) : userClients.length > 0 ? (
              <>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/20 dark:text-purple-400">
                  {userClients.length} {userClients.length === 1 ? 'cliente' : 'clientes'}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Sin clientes</span>
            )}
          </div>
        );
      },
    },
  ];

  const renderUserCard = (user: User) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.alias}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user.mail}
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.activo !== false
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {user.activo !== false ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewUser(user)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleEditUser(user)}
            className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {user.role && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roles:</h4>
          <div className="flex flex-wrap gap-1">
            {[user.role].map((role) => (
              <span
                key={role.id}
                className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400"
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  if (usersLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-400">Administra usuarios, roles y permisos de forma integrada</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
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
      {(usersError || rolesError || permissionsError) && (
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
                {usersError && <p>Usuarios: {usersError}</p>}
                {rolesError && <p>Roles: {rolesError}</p>}
                {permissionsError && <p>Permissions: {permissionsError}</p>}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    clearUsersError();
                    clearRolesError();
                    clearPermissionsError();
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
          data={users}
          columns={columns}
          title="Lista de Usuarios"
          onAdd={handleNewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onView={handleViewUser}
          searchPlaceholder="Buscar usuarios por nombre, email o rol..."
          itemsPerPage={10}
          actions={[
            {
              label: 'Ver',
              icon: EyeIcon,
              onClick: handleViewUser,
              className: 'text-gray-400 hover:text-blue-500'
            },
            {
              label: 'Editar',
              icon: PencilIcon,
              onClick: handleEditUser,
              className: 'text-gray-400 hover:text-yellow-500'
            },
            {
              label: 'Eliminar',
              icon: TrashIcon,
              onClick: handleDeleteUser,
              className: 'text-gray-400 hover:text-red-500'
            }
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map(renderUserCard)}
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Detalles del Usuario
                </h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    <div className="h-16 w-16 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <UserIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {selectedUser.alias}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.mail}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.activo !== false
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {selectedUser.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Roles Asignados:</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.role ? (
                      <span
                        key={selectedUser.role.id}
                        className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {selectedUser.role.name}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Centros Asignados */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Centros Asignados:</h5>
                    <button
                      onClick={() => setShowCenterModal(true)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Gestionar
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {loadingUserData[selectedUser.id] ? (
                        <p className="text-sm text-gray-500">Cargando...</p>
                      ) : (userCentersMap[selectedUser.id] || []).length > 0 ? (
                        (userCentersMap[selectedUser.id] || []).map((center: any) => (
                          <div key={center.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-900 dark:text-gray-100">{center.nombre}</span>
                            <button
                              onClick={() => handleRemoveCenter(center.id)}
                              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Desasignar centro"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay centros asignados</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clientes Asignados */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clientes Asignados (a través de centros):
                  </h5>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {loadingUserData[selectedUser.id] ? (
                        <p className="text-sm text-gray-500">Cargando...</p>
                      ) : (userClientsMap[selectedUser.id] || []).length > 0 ? (
                        <>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Total: {(userClientsMap[selectedUser.id] || []).length} clientes
                          </p>
                          {(userClientsMap[selectedUser.id] || []).slice(0, 5).map((cliente: any) => (
                            <div key={cliente.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div>
                                <span className="text-sm text-gray-900 dark:text-gray-100">{cliente.nombre}</span>
                                {cliente.centro && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{cliente.centro.nombre}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {(userClientsMap[selectedUser.id] || []).length > 5 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              +{(userClientsMap[selectedUser.id] || []).length - 5} más
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay clientes asignados</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      handleEditUser(selectedUser);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowUserDetails(false)}
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

      {/* Center Management Modal */}
      {showCenterModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Gestionar Centros - {selectedUser.alias}
                </h3>
                <button
                  onClick={() => setShowCenterModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Centros Asignados */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Centros Asignados:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {loadingUserData[selectedUser.id] ? (
                      <p className="text-sm text-gray-500">Cargando...</p>
                    ) : (userCentersMap[selectedUser.id] || []).length > 0 ? (
                      (userCentersMap[selectedUser.id] || []).map((center: any) => (
                        <div key={center.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{center.nombre}</span>
                          <button
                            onClick={() => handleRemoveCenter(center.id)}
                            className="px-3 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            Desasignar
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay centros asignados</p>
                    )}
                  </div>
                </div>

                {/* Centros Disponibles */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Centros Disponibles:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {loadingCenters ? (
                      <p className="text-sm text-gray-500">Cargando centros...</p>
                    ) : availableCenters.length > 0 ? (
                      availableCenters
                        .filter(center => !(userCentersMap[selectedUser.id] || []).some((uc: any) => uc.id === center.id))
                        .map((center) => (
                          <div key={center.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{center.nombre}</span>
                              {center.descripcion && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{center.descripcion}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleAssignCenter(center.id)}
                              className="px-3 py-1 text-xs text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                            >
                              Asignar
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay centros disponibles</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowCenterModal(false)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {(isCreating || isEditing) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {isCreating ? 'Crear Usuario' : 'Editar Usuario'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setFormData({ nombre: '', apellido: '', mail: '', alias: '', clave: '', roleId: 0 });
                    setSelectedCenters([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    value={formData.alias || ''}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Ingresa el nombre de usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.mail || ''}
                    onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Ingresa el email"
                  />
                </div>

                {isCreating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      value={formData.clave || ''}
                      onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Ingresa la contraseña"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Roles
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.roleId === role.id}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, roleId: role.id });
                            } else {
                              setFormData({ ...formData, roleId: 0 });
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {role.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Centros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Centros Asignados
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({selectedCenters.length} {selectedCenters.length === 1 ? 'centro seleccionado' : 'centros seleccionados'})
                    </span>
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50 max-h-60 overflow-y-auto">
                    {loadingFormCenters ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cargando centros...</p>
                    ) : formAvailableCenters.length > 0 ? (
                      <div className="space-y-2">
                        {formAvailableCenters.map((center) => (
                          <label
                            key={center.id}
                            className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCenters.includes(center.id)}
                              onChange={() => handleToggleCenter(center.id)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <div className="ml-3 flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {center.nombre}
                              </span>
                              {center.descripcion && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {center.descripcion}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No hay centros disponibles</p>
                    )}
                  </div>
                </div>

                {/* Clientes por Centro */}
                {selectedCenters.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clientes Asignados
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({selectedClients.length} {selectedClients.length === 1 ? 'cliente seleccionado' : 'clientes seleccionados'})
                      </span>
                    </label>
                    <div className="space-y-4">
                      {selectedCenters.map((centerId) => {
                        const center = formAvailableCenters.find(c => c.id === centerId);
                        const clients = centerClientsMap[centerId] || [];
                        const isLoading = loadingCenterClients[centerId];
                        
                        return (
                          <div key={centerId} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
                              {center?.nombre || `Centro ${centerId}`}
                            </div>
                            {isLoading ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Cargando clientes...</p>
                            ) : clients.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {clients.map((cliente) => (
                                  <label
                                    key={cliente.id}
                                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedClients.includes(cliente.id)}
                                      onChange={() => handleToggleClient(cliente.id)}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-3 flex-1">
                                      <span className="text-sm text-gray-900 dark:text-gray-100">
                                        {cliente.nombre}
                                      </span>
                                      {cliente.cuit && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                          CUIT: {cliente.cuit}
                                        </p>
                                      )}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No hay clientes disponibles en este centro</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Selecciona los clientes específicos que el usuario podrá ver
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                      setFormData({ nombre: '', apellido: '', mail: '', alias: '', clave: '', roleId: 0 });
                      setSelectedCenters([]);
                      setSelectedClients([]);
                      setCenterClientsMap({});
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={isCreating ? handleCreateUser : handleUpdateUser}
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
    </div>
  );
};

export default UserManagementPage;
