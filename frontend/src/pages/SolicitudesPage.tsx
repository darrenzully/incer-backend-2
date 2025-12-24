import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { tareaService, Tarea, getEstadoColor, getPrioridadColor, EstadoTarea, Prioridad, TipoSolicitud, User } from '../services/tareaService';
import DataTable, { FilterConfig } from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const SolicitudesPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadosMap, setEstadosMap] = useState<Record<number, string>>({});
  const [prioridadesMap, setPrioridadesMap] = useState<Record<number, string>>({});
  const [tiposSolicitudMap, setTiposSolicitudMap] = useState<Record<number, string>>({});
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [usuariosMap, setUsuariosMap] = useState<Record<number, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // cargar catálogos y luego solicitudes
    const loadCatalogsAndData = async () => {
      try {
        setLoading(true);
        const [estados, prioridades, tiposSolicitud, usuarios] = await Promise.all([
          tareaService.getEstadosDeTarea(),
          tareaService.getPrioridades(),
          tareaService.getTiposSolicitud(),
          tareaService.getUsers()
        ]);

        const eMap = (estados as EstadoTarea[]).reduce<Record<number, string>>((acc, e) => {
          acc[e.id] = e.nombre;
          return acc;
        }, {});
        const pMap = (prioridades as Prioridad[]).reduce<Record<number, string>>((acc, p) => {
          acc[p.id] = p.nombre;
          return acc;
        }, {});
        setEstadosMap(eMap);
        setPrioridadesMap(pMap);
        const tsMap = (tiposSolicitud as TipoSolicitud[]).reduce<Record<number, string>>((acc, t) => {
          acc[t.id] = t.nombre;
          return acc;
        }, {});
        setTiposSolicitudMap(tsMap);
        const uMap = (usuarios as User[]).reduce<Record<number, string>>((acc, u) => {
          acc[u.id] = u.alias;
          return acc;
        }, {});
        setUsuariosMap(uMap);
      } catch (err) {
        console.error('Error cargando catálogos de estados/prioridades:', err);
      } finally {
        await loadSolicitudes();
      }
    };

    loadCatalogsAndData();
  }, []);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await tareaService.getSolicitudes();
      setSolicitudes(data);
    } catch (error) {
      console.error('Error loading solicitudes:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar las solicitudes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (solicitud: Tarea) => {
    navigate(`/solicitudes/${solicitud.id}`);
  };

  const columns = [
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
      key: 'estadoTarea',
      label: 'Estado',
      render: (value: any, row: Tarea) => {
        const nombre = row?.estadoTarea?.nombre || estadosMap[row?.estadoTareaId as number];
        const label = nombre || 'N/A';
        const color = nombre ? getEstadoColor(nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
            {label}
          </span>
        );
      }
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
          {row?.usuario?.alias || usuariosMap[row?.usuarioId as number] || 'N/A'}
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
      key: 'prioridad',
      label: 'Prioridad',
      render: (value: any, row: Tarea) => {
        const nombre = row?.prioridad?.nombre || prioridadesMap[row?.prioridadId as number];
        const label = nombre || 'N/A';
        const color = nombre ? getPrioridadColor(nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'tipoSolicitud',
      label: 'Tipo de Solicitud',
      render: (value: any, row: Tarea) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.tipoSolicitud?.nombre || tiposSolicitudMap[row?.tipoSolicitudId as number] || 'N/A'}
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
    }
  ];

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {solicitudes.map((solicitud) => (
        <div key={solicitud.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {solicitud.nombre}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Fecha:</span> {new Date(solicitud.fecha).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Sucursal:</span> {solicitud.sucursal?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span> {solicitud.sucursal?.cliente?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Tipo de Solicitud:</span> {solicitud.tipoSolicitud?.nombre || tiposSolicitudMap[solicitud.tipoSolicitudId as number] || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Usuario:</span> {solicitud.usuario?.alias || usuariosMap[solicitud.usuarioId as number] || 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                solicitud.estadoTarea ? getEstadoColor(solicitud.estadoTarea.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {solicitud.estadoTarea?.nombre || 'N/A'}
              </span>
              {solicitud.prioridad && (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  getPrioridadColor(solicitud.prioridad.nombre)
                }`}>
                  {solicitud.prioridad.nombre}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleView(solicitud)}
              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              title="Ver"
            >
              <EyeIcon className="w-4 h-4" />
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
            Solicitudes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualiza las solicitudes finalizadas o asignadas
          </p>
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
          data={solicitudes}
          columns={columns}
          actions={actions}
          searchPlaceholder="Buscar por estado..."
          filters={filterConfig}
          enableAdvancedFilters={true}
        />
      ) : (
        renderGridView()
      )}
    </div>
  );
};

export default SolicitudesPage;
