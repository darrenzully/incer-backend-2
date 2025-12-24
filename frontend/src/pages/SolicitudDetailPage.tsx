import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { tareaService, Tarea, getEstadoColor, getPrioridadColor, EstadoTarea, Prioridad, TipoSolicitud } from '../services/tareaService';
import Notification from '../components/Notification';

const SolicitudDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState(true);
  const [estadosMap, setEstadosMap] = useState<Record<number, string>>({});
  const [prioridadesMap, setPrioridadesMap] = useState<Record<number, string>>({});
  const [tiposSolicitudMap, setTiposSolicitudMap] = useState<Record<number, string>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [estados, prioridades, tiposSolicitud] = await Promise.all([
          tareaService.getEstadosDeTarea(),
          tareaService.getPrioridades(),
          tareaService.getTiposSolicitud()
        ]);

        const eMap = (estados as EstadoTarea[]).reduce<Record<number, string>>((acc, e) => { acc[e.id] = e.nombre; return acc; }, {});
        const pMap = (prioridades as Prioridad[]).reduce<Record<number, string>>((acc, p) => { acc[p.id] = p.nombre; return acc; }, {});
        const tsMap = (tiposSolicitud as TipoSolicitud[]).reduce<Record<number, string>>((acc, t) => { acc[t.id] = t.nombre; return acc; }, {});
        setEstadosMap(eMap);
        setPrioridadesMap(pMap);
        setTiposSolicitudMap(tsMap);
      } catch (err) {
        console.error('Error cargando catálogos detalle:', err);
      }
    };

    loadCatalogs().finally(() => {
      if (id) {
        loadSolicitud();
      }
    });
  }, [id]);

  const loadSolicitud = async () => {
    try {
      setLoading(true);
      const data = await tareaService.getById(Number(id));
      setSolicitud(data);
    } catch (error) {
      console.error('Error loading solicitud:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar la solicitud'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/solicitudes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Solicitud no encontrada</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Volver a Solicitudes
        </button>
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Volver"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Detalle de Solicitud
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Información completa de la solicitud
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
              <p className="text-gray-900 dark:text-white">{solicitud.sucursal?.cliente?.nombre || 'N/A'}</p>
            </div>

            {/* 2. Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sucursal</label>
              <p className="text-gray-900 dark:text-white">{solicitud.sucursal?.nombre || 'N/A'}</p>
            </div>

            {/* 3. Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
              <p className="text-gray-900 dark:text-white">{solicitud.nombre || 'N/A'}</p>
            </div>

            {/* 4. Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              {(() => {
                const nombre = solicitud.estadoTarea?.nombre || estadosMap[solicitud.estadoTareaId as number];
                const label = nombre || 'N/A';
                const color = nombre ? getEstadoColor(nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
                return (
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${color}`}>
                    {label}
                  </span>
                );
              })()}
            </div>

            {/* 5. Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
              <p className="text-gray-900 dark:text-white">{solicitud.fecha ? new Date(solicitud.fecha).toLocaleDateString() : 'N/A'}</p>
            </div>

            {/* 6. Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
              {(() => {
                const nombre = solicitud.prioridad?.nombre || prioridadesMap[solicitud.prioridadId as number];
                const label = nombre || 'N/A';
                const color = nombre ? getPrioridadColor(nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
                return (
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${color}`}>
                    {label}
                  </span>
                );
              })()}
            </div>

            {/* 7. Tipo de Solicitud */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Solicitud</label>
              <p className="text-gray-900 dark:text-white">{solicitud.tipoSolicitud?.nombre || tiposSolicitudMap[solicitud.tipoSolicitudId as number] || 'N/A'}</p>
            </div>

            {/* 8. Tipo de Tarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Tarea</label>
              <p className="text-gray-900 dark:text-white">{solicitud.tipoDeTarea?.nombre || 'N/A'}</p>
            </div>

            {/* 9. Periodicidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodicidad</label>
              <p className="text-gray-900 dark:text-white">{solicitud.periodicidad?.nombre || 'N/A'}</p>
            </div>

            {/* 10. Tipo de Producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Producto</label>
              <p className="text-gray-900 dark:text-white">{solicitud.tipoDeProducto?.nombre || 'N/A'}</p>
            </div>

            {/* 11. Presupuesto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Presupuesto</label>
              <p className="text-gray-900 dark:text-white">{solicitud.presupuesto ? `${solicitud.presupuesto.numero} - ${solicitud.presupuesto.descripcion}` : 'N/A'}</p>
            </div>

            {/* 12. Contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contacto</label>
              <p className="text-gray-900 dark:text-white">{solicitud.contacto?.detalles || 'N/A'}</p>
            </div>

            {/* 13. Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
              <p className="text-gray-900 dark:text-white">{solicitud.fechaFin || 'N/A'}</p>
            </div>

            {/* 14. Duración / Frecuencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duración</label>
              <p className="text-gray-900 dark:text-white">{solicitud.duracion ?? 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia</label>
              <p className="text-gray-900 dark:text-white">{solicitud.frecuencia ?? 'N/A'}</p>
            </div>

            {/* 15. Fecha Recepción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Recepción</label>
              <p className="text-gray-900 dark:text-white">{solicitud.fechaRecepcion ? new Date(solicitud.fechaRecepcion).toLocaleDateString() : 'N/A'}</p>
            </div>

            {/* 16. Activo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Activo</label>
              <p className="text-gray-900 dark:text-white">{solicitud.activo ? 'Sí' : 'No'}</p>
            </div>

            {/* 17. Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{solicitud.descripcion || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudDetailPage;
