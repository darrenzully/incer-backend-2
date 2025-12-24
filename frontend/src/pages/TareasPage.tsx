import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { tareaService, Tarea, getEstadoColor, getPrioridadColor } from '../services/tareaService';
import DataTable, { FilterConfig } from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const TareasPage: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTareas();
  }, []);

  const loadTareas = async () => {
    try {
      setLoading(true);
      const data = await tareaService.getAll(); // Cambiar de getTareasPendientes() a getAll()
      setTareas(data);
    } catch (error) {
      console.error('Error loading tareas:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar las tareas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/tareas/nuevo');
  };

  const handleEdit = (tarea: Tarea) => {
    navigate(`/tareas/${tarea.id}/editar`);
  };

  const handleView = (tarea: Tarea) => {
    navigate(`/tareas/${tarea.id}`);
  };

  const handleDelete = async (tarea: Tarea) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${tarea.nombre}"?`)) {
      try {
        await tareaService.delete(tarea.id);
        setNotification({
          type: 'success',
          message: 'Tarea eliminada exitosamente'
        });
        loadTareas();
      } catch (error) {
        console.error('Error deleting tarea:', error);
        setNotification({
          type: 'error',
          message: 'Error al eliminar la tarea'
        });
      }
    }
  };

  const columns = [
    {
      key: 'activo',
      label: 'Activo',
      render: (value: any, row: Tarea) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row?.activo 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {row?.activo ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      key: 'tipoDeTarea',
      label: 'Tipo',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.tipoDeTarea?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'estadoTarea',
      label: 'Estado',
      render: (value: any, row: Tarea) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          row?.estadoTarea ? getEstadoColor(row.estadoTarea.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {row?.estadoTarea?.nombre || 'N/A'}
        </span>
      )
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.fecha ? new Date(row.fecha).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.usuario?.alias || 'N/A'}
        </div>
      )
    },
    {
      key: 'nombre',
      label: 'Título',
      render: (value: any, row: Tarea) => (
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.sucursal?.cliente?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.sucursal?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'tipoDeProducto',
      label: 'Producto',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.tipoDeProducto?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'fechaRecepcion',
      label: 'Fecha de recepción del servidor',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.fechaRecepcion ? new Date(row.fechaRecepcion).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ];

  // Configuración de filtros avanzados
  const filterConfig: FilterConfig[] = [
    {
      key: 'cliente',
      label: 'Cliente',
      type: 'select',
      nestedKey: 'sucursal.cliente.nombre'
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      type: 'select',
      nestedKey: 'sucursal.nombre'
    },
    {
      key: 'fecha',
      label: 'Fecha',
      type: 'daterange'
    }
  ];

  const actions = [
    {
      label: 'Ver',
      icon: EyeIcon,
      onClick: handleView,
      className: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
    },
    {
      label: 'Editar',
      icon: PencilIcon,
      onClick: handleEdit,
      className: 'text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
    },
    {
      label: 'Eliminar',
      icon: TrashIcon,
      onClick: handleDelete,
      className: 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
    }
  ];

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tareas.map((tarea) => (
        <div key={tarea.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {tarea.nombre}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Fecha:</span> {new Date(tarea.fecha).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Sucursal:</span> {tarea.sucursal?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span> {tarea.sucursal?.cliente?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Tipo:</span> {tarea.tipoDeTarea?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Usuario:</span> {tarea.usuario?.alias || 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                tarea.estadoTarea ? getEstadoColor(tarea.estadoTarea.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {tarea.estadoTarea?.nombre || 'N/A'}
              </span>
              {tarea.prioridad && (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getPrioridadColor(tarea.prioridad.nombre)
                }`}>
                  {tarea.prioridad.nombre}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => handleView(tarea)}
              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              title="Ver"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(tarea)}
              className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              title="Editar"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(tarea)}
              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              title="Eliminar"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tareas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las tareas del sistema
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nueva Tarea
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={tareas}
          columns={columns}
          actions={actions}
          searchPlaceholder="Buscar por nombre, sucursal, cliente o tipo..."
          filters={filterConfig}
          enableAdvancedFilters={true}
        />
      ) : (
        renderGridView()
      )}
    </div>
  );
};

export default TareasPage;
