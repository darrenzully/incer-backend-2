import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  TagIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { getCheckLists, deleteCheckList, CheckList } from '../services/checkListService';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';
import DataTable from '../components/DataTable';

const CheckListsPage: React.FC = () => {
  const [checkLists, setCheckLists] = useState<CheckList[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCheckLists();
  }, []);

  const loadCheckLists = async () => {
    try {
      setLoading(true);
      const data = await getCheckLists();
      setCheckLists(data);
    } catch (error) {
      console.error('Error al cargar checklists:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los checklists'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/checklists/nuevo');
  };

  const handleEdit = (checkList: CheckList) => {
    navigate(`/checklists/${checkList.id}/editar`);
  };

  const handleDelete = async (checkList: CheckList) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el checklist "${checkList.tipoDeProducto?.nombre}"?`)) {
      try {
        await deleteCheckList(checkList.id);
        await loadCheckLists();
        setNotification({
          type: 'success',
          message: 'Checklist eliminado correctamente'
        });
      } catch (error) {
        console.error('Error al eliminar checklist:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar el checklist'
        });
      }
    }
  };

  const handleView = (checkList: CheckList) => {
    navigate(`/checklists/${checkList.id}`);
  };

  const columns = [
    {
      key: 'activo',
      label: 'Activo',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'porDefecto',
      label: 'Por Defecto',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'tipoDeProducto',
      label: 'Tipo de Producto',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value?.nombre || 'N/A'}
        </div>
      ),
    },
    {
      key: 'tipoDeElemento',
      label: 'Tipo de Instalación',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {value?.nombre || '-'}
        </div>
      ),
    },
    {
      key: 'version',
      label: 'Versión',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          v{value}
        </div>
      ),
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || ''}
        </div>
      ),
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Checklists</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todos los checklists del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={checkLists}
          columns={columns}
          title="Lista de Checklists"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por tipo de producto..."
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
              label: 'Eliminar',
              icon: TrashIcon,
              onClick: handleDelete,
              className: 'text-gray-400 hover:text-red-500'
            }
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {checkLists.map((checkList) => (
            <div
              key={checkList.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {checkList.tipoDeProducto?.nombre || 'Sin nombre'}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      v{checkList.version}
                    </p>
                    <div className="flex space-x-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        checkList.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {checkList.activo ? 'Activo' : 'Inactivo'}
                      </div>
                      {checkList.porDefecto && (
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Por Defecto
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <TagIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {checkList.tipoDeProducto?.nombre || 'Sin tipo'}
                    </span>
                  </div>

                  {checkList.tipoDeElemento && (
                    <div className="flex items-center text-sm">
                      <TagIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {checkList.tipoDeElemento.nombre}
                      </span>
                    </div>
                  )}

                  {checkList.sucursal && (
                    <div className="flex items-center text-sm">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {checkList.sucursal.nombre}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    {checkList.activo ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      {checkList.activo ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(checkList)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(checkList)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(checkList)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default CheckListsPage;
