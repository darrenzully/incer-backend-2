import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { getTiposElemento, deleteTipoElemento, TipoElemento } from '../services/tipoElementoService';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';
import DataTable from '../components/DataTable';

const TipoElementosPage: React.FC = () => {
  const [tiposElemento, setTiposElemento] = useState<TipoElemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTiposElemento();
  }, []);

  const loadTiposElemento = async () => {
    try {
      setLoading(true);
      const data = await getTiposElemento();
      setTiposElemento(data);
    } catch (error) {
      console.error('Error al cargar tipos de elemento:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los tipos de elemento'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/tipos-elemento/nuevo');
  };

  const handleEdit = (tipo: TipoElemento) => {
    navigate(`/tipos-elemento/${tipo.id}/editar`);
  };

  const handleDelete = async (tipo: TipoElemento) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el tipo "${tipo.nombre}"?`)) {
      try {
        await deleteTipoElemento(tipo.id);
        await loadTiposElemento();
        setNotification({
          type: 'success',
          message: 'Tipo de elemento eliminado correctamente'
        });
      } catch (error) {
        console.error('Error al eliminar tipo de elemento:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar el tipo de elemento'
        });
      }
    }
  };

  const handleView = (tipo: TipoElemento) => {
    navigate(`/tipos-elemento/${tipo.id}`);
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
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tipos de Inst. Fijas</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona todos los tipos de instalaciones fijas del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={() => navigate('/tipos-elemento/admin')}
            className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Administración
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={tiposElemento}
          columns={columns}
          title="Lista de Tipos de Instalaciones Fijas"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por nombre..."
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
          {tiposElemento.map((tipo, index) => (
            <div
              key={tipo.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {tipo.nombre}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tipo.activo 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {tipo.activo ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <CubeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Tipo de Instalación Fija
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    {tipo.activo ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className="text-gray-600 dark:text-gray-300">
                      {tipo.activo ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(tipo)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(tipo)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tipo)}
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

export default TipoElementosPage;
