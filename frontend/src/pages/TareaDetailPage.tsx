import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { tareaService, Tarea } from '../services/tareaService';
import Notification from '../components/Notification';

const TareaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type?: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (id) {
      loadTarea();
    }
  }, [id]);

  const loadTarea = async () => {
    try {
      setLoading(true);
      const data = await tareaService.getById(Number(id));
      setTarea(data);
    } catch (error) {
      console.error('Error loading tarea:', error);
      setNotification({ message: 'Error al cargar la tarea', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tarea) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Tarea no encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detalle de Tarea
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              ID: {tarea.id}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Tipo de Tarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Tarea
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.tipoDeTarea?.nombre || 'N/A'}
            </p>
          </div>

          {/* 2. Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <p className="text-gray-900 dark:text-white">{tarea.nombre || 'N/A'}</p>
          </div>

          {/* 3. Fecha de Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Inicio
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.fecha ? new Date(tarea.fecha).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* 4. Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Producto
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.tipoDeProducto?.nombre || 'N/A'}
            </p>
          </div>

          {/* 5. Periodicidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Periodicidad
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.periodicidad?.nombre || 'N/A'}
            </p>
          </div>

          {/* 6. Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.sucursal?.cliente?.nombre || 'N/A'}
            </p>
          </div>

          {/* 7. Sucursal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sucursal
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.sucursal?.nombre || 'N/A'}
            </p>
          </div>

          {/* 8. Activo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Activo
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.activo ? 'Sí' : 'No'}
            </p>
          </div>

          {/* 9. Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.descripcion || 'N/A'}
            </p>
          </div>

          {/* Campos adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.estadoTarea?.nombre || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Recepción
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.fechaRecepcion ? new Date(tarea.fechaRecepcion).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Usuario Asignado
            </label>
            <p className="text-gray-900 dark:text-white">
              {tarea.usuario?.alias || tarea.usuario?.mail || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      <Notification
        message={notification?.message || ''}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default TareaDetailPage;