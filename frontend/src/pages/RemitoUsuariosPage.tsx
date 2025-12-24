import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import {
  getRemitoUsuarios,
  deleteRemitoUsuario,
  RemitoUsuario
} from '../services/remitoUsuarioService';
import DataTable from '../components/DataTable';
import Notification from '../components/Notification';
import ViewToggle from '../components/ViewToggle';

const RemitoUsuariosPage: React.FC = () => {
  const navigate = useNavigate();
  const [remitoUsuarios, setRemitoUsuarios] = useState<RemitoUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadRemitoUsuarios();
  }, []);

  const loadRemitoUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getRemitoUsuarios();
      setRemitoUsuarios(data);
    } catch (error) {
      console.error('Error al cargar asignaciones de remitos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar las asignaciones de remitos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (remitoUsuario: RemitoUsuario) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la asignación de "${remitoUsuario.chofer ? `${remitoUsuario.chofer.nombre} ${remitoUsuario.chofer.apellido}`.trim() : 'N/A'}"?`)) {
      try {
        await deleteRemitoUsuario(remitoUsuario.id);
        await loadRemitoUsuarios();
        setNotification({
          type: 'success',
          message: 'Asignación de remitos eliminada correctamente'
        });
      } catch (error) {
        console.error('Error al eliminar asignación de remitos:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar la asignación de remitos'
        });
      }
    }
  };

  const handleView = (remitoUsuario: RemitoUsuario) => {
    navigate(`/remito-usuarios/${remitoUsuario.id}`);
  };

  const handleEdit = (remitoUsuario: RemitoUsuario) => {
    navigate(`/remito-usuarios/${remitoUsuario.id}/editar`);
  };

  const handleAdd = () => {
    navigate('/remito-usuarios/nuevo');
  };

  const columns = [
    {
      key: 'chofer',
      label: 'Chofer',
      sortable: true,
      render: (value: any, row: RemitoUsuario) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {row.chofer ? `${row.chofer.nombre} ${row.chofer.apellido}`.trim() : 'N/A'}
        </div>
      ),
    },
    {
      key: 'letra',
      label: 'Letra',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'secuencia',
      label: 'Secuencia',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'numeroDesde',
      label: 'Nro desde',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.toLocaleString() || '-'}
        </div>
      ),
    },
    {
      key: 'numeroHasta',
      label: 'Nro hasta',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.toLocaleString() || '-'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Asignación de Remitos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestiona las asignaciones de rangos de números de remitos por chofer</p>
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
          data={remitoUsuarios}
          columns={columns}
          title="Lista de Asignaciones de Remitos"
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchPlaceholder="Buscar por chofer, letra, secuencia o números..."
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
          {remitoUsuarios.map((remitoUsuario) => (
            <div
              key={remitoUsuario.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {remitoUsuario.chofer ? `${remitoUsuario.chofer.nombre} ${remitoUsuario.chofer.apellido}`.trim() : 'N/A'}
                  </h3>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Letra:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {remitoUsuario.letra || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Secuencia:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {remitoUsuario.secuencia || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Nro desde:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {remitoUsuario.numeroDesde?.toLocaleString() || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Nro hasta:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {remitoUsuario.numeroHasta?.toLocaleString() || '-'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleView(remitoUsuario)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(remitoUsuario)}
                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    title="Editar"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(remitoUsuario)}
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

export default RemitoUsuariosPage;
