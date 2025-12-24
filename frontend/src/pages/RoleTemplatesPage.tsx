import React, { useState, useEffect, useCallback } from 'react';
import { 
  RoleTemplate, 
  CreateRoleTemplateRequest, 
  UpdateRoleTemplateRequest,
  CreateRoleFromTemplateRequest,
  DuplicateTemplateRequest,
  DetailedRoleTemplate,
  Permission
} from '../services/roleTemplateService';
import { useRoleTemplates } from '../hooks/useRoleTemplates';
import { roleTemplateService } from '../services/roleTemplateService';
import DataTable, { FilterConfig } from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const RoleTemplatesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RoleTemplate | null>(null);
  const [detailedTemplate, setDetailedTemplate] = useState<DetailedRoleTemplate | null>(null);

  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplates,
    loadTemplatesByCategory,
    loadSystemTemplates,
    loadBusinessTemplates,
    createRoleFromTemplate,
    applyTemplateToRole,
    duplicateTemplate,
    getDetailedTemplate,
    clearError
  } = useRoleTemplates();

  // Form states
  const [createForm, setCreateForm] = useState<CreateRoleTemplateRequest>({
    name: '',
    description: '',
    category: 'business',
    isSystem: false,
    priority: 1,
    active: true
  });

  const [editForm, setEditForm] = useState<UpdateRoleTemplateRequest>({
    id: 0,
    name: '',
    description: '',
    category: 'business',
    isSystem: false,
    priority: 1,
    active: true
  });

  const [duplicateForm, setDuplicateForm] = useState<DuplicateTemplateRequest>({
    name: '',
    description: ''
  });

  const [createRoleForm, setCreateRoleForm] = useState<CreateRoleFromTemplateRequest>({
    name: '',
    description: ''
  });

  // Estados para permisos
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const handleDelete = async (template: RoleTemplate) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la plantilla "${template.name}"?`)) return;
    try {
      await deleteTemplate(template.id);
      setNotification({ type: 'success', message: 'Plantilla eliminada exitosamente' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al eliminar plantilla' });
    }
  };

  const handleEdit = (template: RoleTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      id: template.id,
      name: template.name,
      description: template.description || '',
      category: template.category,
      isSystem: template.isSystem,
      priority: template.priority,
      active: template.active
    });
    setShowEditModal(true);
  };

  const handleView = async (template: RoleTemplate) => {
    try {
      const detailed = await getDetailedTemplate(template.id);
      setDetailedTemplate(detailed);
      setSelectedTemplate(template);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading template details:', err);
      setNotification({ type: 'error', message: 'Error al cargar detalles de la plantilla' });
    }
  };

  const handleNew = () => {
    setShowCreateModal(true);
  };

  const handleDuplicateClick = (template: RoleTemplate) => {
    setSelectedTemplate(template);
    setDuplicateForm({
      name: `${template.name} (Copia)`,
      description: template.description || ''
    });
    setShowDuplicateModal(true);
  };

  const handleCreateRoleClick = (template: RoleTemplate) => {
    setSelectedTemplate(template);
    setCreateRoleForm({
      name: `Nuevo ${template.name}`,
      description: template.description || ''
    });
    setShowCreateRoleModal(true);
  };

  // Configuración de filtros avanzados
  const filterConfig: FilterConfig[] = [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Filtrar por nombre...'
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'text',
      placeholder: 'Filtrar por descripción...'
    },
    {
      key: 'category',
      label: 'Categoría',
      type: 'select',
      options: [
        { value: 'system', label: 'Sistema' },
        { value: 'business', label: 'Negocio' },
        { value: 'client', label: 'Cliente' },
        { value: 'audit', label: 'Auditoría' }
      ]
    },
    {
      key: 'active',
      label: 'Estado',
      type: 'boolean'
    }
  ];

  const columns = [
    {
      key: 'active',
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
      render: (value: string, row: RoleTemplate) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.description || 'Sin descripción'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categoría',
      sortable: true,
      render: (value: string) => {
        const categoryMap: { [key: string]: { label: string; className: string } } = {
          'system': { label: 'Sistema', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
          'business': { label: 'Negocio', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
          'client': { label: 'Cliente', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
          'audit': { label: 'Auditoría', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' }
        };
        const category = categoryMap[value] || { label: value, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.className}`}>
            {category.label}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: 'Prioridad',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'isSystem',
      label: 'Tipo',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }`}>
          {value ? 'Sistema' : 'Personalizada'}
        </span>
      ),
    },
  ];

  // Load permissions
  const loadPermissions = useCallback(async () => {
    try {
      setLoadingPermissions(true);
      const permissions = await roleTemplateService.getAllPermissions();
      setAvailablePermissions(permissions);
    } catch (err) {
      console.error('Error loading permissions:', err);
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // Load permissions on component mount
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Crear la plantilla primero
      const newTemplate = await createTemplate(createForm);
      
      // Asignar permisos seleccionados
      if (selectedPermissions.length > 0) {
        for (const permissionId of selectedPermissions) {
          try {
            await roleTemplateService.assignPermissionToTemplate(newTemplate.id, permissionId);
          } catch (err) {
            console.error(`Error assigning permission ${permissionId}:`, err);
          }
        }
      }
      
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        category: 'business',
        isSystem: false,
        priority: 1,
        active: true
      });
      setSelectedPermissions([]);
      setNotification({ type: 'success', message: 'Plantilla creada exitosamente' });
    } catch (err) {
      console.error('Error creating template:', err);
      setNotification({ type: 'error', message: 'Error al crear plantilla' });
    }
  };

  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTemplate(editForm);
      setShowEditModal(false);
      setSelectedTemplate(null);
      setNotification({ type: 'success', message: 'Plantilla actualizada exitosamente' });
    } catch (err) {
      console.error('Error updating template:', err);
      setNotification({ type: 'error', message: 'Error al actualizar plantilla' });
    }
  };

  const handleDuplicateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    
    try {
      await duplicateTemplate(selectedTemplate.id, duplicateForm);
      setShowDuplicateModal(false);
      setSelectedTemplate(null);
      setDuplicateForm({ name: '', description: '' });
      setNotification({ type: 'success', message: 'Plantilla duplicada exitosamente' });
    } catch (err) {
      console.error('Error duplicating template:', err);
      setNotification({ type: 'error', message: 'Error al duplicar plantilla' });
    }
  };

  const handleCreateRoleFromTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    
    try {
      await createRoleFromTemplate(selectedTemplate.id, createRoleForm);
      setShowCreateRoleModal(false);
      setSelectedTemplate(null);
      setCreateRoleForm({ name: '', description: '' });
      setNotification({ type: 'success', message: 'Rol creado exitosamente' });
    } catch (err) {
      console.error('Error creating role from template:', err);
      setNotification({ type: 'error', message: 'Error al crear rol' });
    }
  };

  const handleShowDetails = async (template: RoleTemplate) => {
    try {
      const details = await getDetailedTemplate(template.id);
      setDetailedTemplate(details);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error loading template details:', err);
    }
  };

  const handleEditClick = (template: RoleTemplate) => {
    setEditForm({
      id: template.id,
      name: template.name,
      description: template.description || '',
      category: template.category,
      isSystem: template.isSystem,
      priority: template.priority,
      active: template.active
    });
    setShowEditModal(true);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(availablePermissions.map(p => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setSelectedPermissions([]);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Plantillas de Roles</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona las plantillas de roles del sistema</p>
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
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error al cargar plantillas
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-600 dark:hover:text-red-400"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <DataTable
          data={templates}
          columns={columns}
          title="Lista de Plantillas de Roles"
          onAdd={handleNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar plantillas..."
          itemsPerPage={10}
          actions={[
            {
              label: 'Ver',
              icon: EyeIcon,
              onClick: handleView,
              className: 'text-gray-400 hover:text-blue-500'
            },
            {
              label: 'Editar',
              icon: PencilIcon,
              onClick: handleEdit,
              className: 'text-gray-400 hover:text-yellow-500'
            },
            {
              label: 'Duplicar',
              icon: ClipboardDocumentListIcon,
              onClick: handleDuplicateClick,
              className: 'text-gray-400 hover:text-indigo-500'
            },
            {
              label: 'Crear Rol',
              icon: UsersIcon,
              onClick: handleCreateRoleClick,
              className: 'text-gray-400 hover:text-green-500'
            },
            {
              label: 'Eliminar',
              icon: TrashIcon,
              onClick: handleDelete,
              className: 'text-gray-400 hover:text-red-500'
            }
          ]}
          filters={filterConfig}
          enableAdvancedFilters={true}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                          <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {template.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {template.active ? 'Activa' : 'Inactiva'}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      template.category === 'system' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                      template.category === 'business' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      template.category === 'client' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {template.category === 'system' ? 'Sistema' :
                       template.category === 'business' ? 'Negocio' :
                       template.category === 'client' ? 'Cliente' : 'Auditoría'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Prioridad:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {template.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      template.isSystem 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {template.isSystem ? 'Sistema' : 'Personalizada'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(template)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {!template.isSystem && (
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                      title="Editar"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicateClick(template)}
                    className="p-2 text-gray-400 hover:text-indigo-500 transition-colors duration-200"
                    title="Duplicar"
                  >
                    <ClipboardDocumentListIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCreateRoleClick(template)}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors duration-200"
                    title="Crear rol"
                  >
                    <UsersIcon className="w-4 h-4" />
                  </button>
                  {!template.isSystem && (
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      title="Eliminar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Nueva Plantilla</h2>
            <form onSubmit={handleCreateTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="business">Negocio</option>
                  <option value="client">Cliente</option>
                  <option value="audit">Auditoría</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <input
                  type="number"
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="1"
                />
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="active"
                  checked={createForm.active}
                  onChange={(e) => setCreateForm({ ...createForm, active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm text-gray-700 dark:text-gray-300">
                  Activa
                </label>
              </div>

              {/* Sección de Permisos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Permisos ({selectedPermissions.length} seleccionados)
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Seleccionar Todos
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPermissions}
                      className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Deseleccionar Todos
                    </button>
                  </div>
                </div>
                
                {loadingPermissions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                            >
                              {permission.name}
                            </label>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {permission.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {permission.resource}.{permission.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedPermissions([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Plantilla</h2>
            <form onSubmit={handleEditTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="business">Negocio</option>
                  <option value="client">Cliente</option>
                  <option value="audit">Auditoría</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <input
                  type="number"
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="1"
                />
              </div>
              
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={editForm.active}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="editActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Activa
                </label>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Template Modal */}
      {showDuplicateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Duplicar Plantilla: {selectedTemplate.name}
            </h2>
            <form onSubmit={handleDuplicateTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la nueva plantilla
                </label>
                <input
                  type="text"
                  value={duplicateForm.name}
                  onChange={(e) => setDuplicateForm({ ...duplicateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={duplicateForm.description}
                  onChange={(e) => setDuplicateForm({ ...duplicateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDuplicateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Duplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role from Template Modal */}
      {showCreateRoleModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Crear Rol desde: {selectedTemplate.name}
            </h2>
            <form onSubmit={handleCreateRoleFromTemplate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del rol
                </label>
                <input
                  type="text"
                  value={createRoleForm.name}
                  onChange={(e) => setCreateRoleForm({ ...createRoleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={createRoleForm.description}
                  onChange={(e) => setCreateRoleForm({ ...createRoleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRoleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Crear Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Details Modal */}
      {showDetailsModal && detailedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Detalles de: {detailedTemplate.name}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Información General</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Descripción:</span> {detailedTemplate.description || 'Sin descripción'}</p>
                  <p><span className="font-medium">Categoría:</span> {roleTemplateService.getCategoryDisplayName(detailedTemplate.category)}</p>
                  <p><span className="font-medium">Prioridad:</span> {detailedTemplate.priority}</p>
                  <p><span className="font-medium">Estado:</span> 
                    <span className={detailedTemplate.active ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                      {detailedTemplate.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </p>
                  <p><span className="font-medium">Tipo:</span> {detailedTemplate.isSystem ? 'Sistema' : 'Personalizada'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Permisos ({detailedTemplate.permissions.length})
                </h3>
                <div className="max-h-64 overflow-y-auto">
                  {detailedTemplate.permissions.length > 0 ? (
                    <div className="space-y-2">
                      {detailedTemplate.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{permission.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{permission.description}</p>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {permission.resource}.{permission.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No hay permisos asignados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleTemplatesPage;