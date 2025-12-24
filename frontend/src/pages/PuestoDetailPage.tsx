import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  FireIcon,
  TagIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { puestoService, Puesto } from '../services/puestoService';
import Notification from '../components/Notification';

const PuestoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [puesto, setPuesto] = useState<Puesto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const loadPuesto = useCallback(async () => {
    try {
      setLoading(true);
      const data = await puestoService.getById(parseInt(id!));
      setPuesto(data);
    } catch (error) {
      console.error('Error al cargar puesto:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del puesto'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPuesto();
    }
  }, [id, loadPuesto]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!puesto) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Puesto no encontrado
          </h1>
          <button
            onClick={() => navigate('/puestos')}
            className="text-primary-500 hover:text-primary-600"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/puestos')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Puesto {puesto.nombre ? `"${puesto.nombre}"` : `#${puesto.id}`}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  ID: {puesto.id}
                </p>
                {puesto.codigo && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Código: {puesto.codigo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                puesto.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {puesto.activo ? 'Activo' : 'Inactivo'}
              </div>
              <button
                onClick={() => navigate(`/puestos/edit/${puesto.id}`)}
                className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Editar
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Información General */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información General
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      ID del Puesto
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {puesto.id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center">
                      {puesto.activo ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {puesto.nombre && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Nombre del Puesto
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.nombre}
                      </p>
                    </div>
                  )}

                  {puesto.codigo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Código
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.codigo}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Deshabilitado
                    </label>
                    <div className="flex items-center">
                      {puesto.deshabilitado ? (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.deshabilitado ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>

                  {puesto.fechaDeshabilitacion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Fecha de Deshabilitación
                      </label>
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatDate(puesto.fechaDeshabilitacion)}
                        </p>
                      </div>
                    </div>
                  )}

                  {puesto.ubicacion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Ubicación
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.ubicacion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Asignación */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información de Asignación
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {puesto.sucursal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Sucursal Asignada
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.sucursal.nombre}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {puesto.sucursal.id}
                      </p>
                    </div>
                  )}

                  {puesto.extintor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Extintor Asignado
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        ID: {puesto.extintor.id}
                      </p>
                      {puesto.extintor.codigo && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Código: {puesto.extintor.codigo}
                        </p>
                      )}
                      {puesto.extintor.nroSerie && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nº Serie: {puesto.extintor.nroSerie}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {puesto.ubicacion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Ubicación Específica
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.ubicacion}
                      </p>
                    </div>
                  )}

                  {puesto.codigo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Código del Puesto
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.codigo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estado del Sistema */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Estado del Sistema
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado General
                    </label>
                    <div className="flex items-center">
                      {puesto.activo ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.activo ? 'Puesto Activo' : 'Puesto Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado de Deshabilitación
                    </label>
                    <div className="flex items-center">
                      {puesto.deshabilitado ? (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.deshabilitado ? 'Deshabilitado' : 'Habilitado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {puesto.fechaDeshabilitacion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Fecha de Deshabilitación
                      </label>
                      <div className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <p className={`text-lg font-medium ${
                          isExpired(puesto.fechaDeshabilitacion) 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatDate(puesto.fechaDeshabilitacion)}
                        </p>
                        {isExpired(puesto.fechaDeshabilitacion) && (
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ml-2" />
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado de Asignación
                    </label>
                    <div className="flex items-center">
                      {puesto.extintor ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {puesto.extintor ? 'Con Extintor' : 'Sin Extintor'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Estado y Tipo */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Estado y Tipo
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  {puesto.activo ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {puesto.activo ? 'Puesto Activo' : 'Puesto Inactivo'}
                  </span>
                </div>

                <div className="flex items-center">
                  {puesto.deshabilitado ? (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  ) : (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {puesto.deshabilitado ? 'Deshabilitado' : 'Habilitado'}
                  </span>
                </div>

                {puesto.nombre && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Nombre
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {puesto.nombre}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Asignación */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Información de Asignación
              </h3>
              
              <div className="space-y-4">
                {puesto.sucursal && (
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Sucursal
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {puesto.sucursal.nombre}
                      </p>
                    </div>
                  </div>
                )}

                {puesto.extintor && (
                  <div className="flex items-center">
                    <FireIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Extintor
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {puesto.extintor.id}
                      </p>
                    </div>
                  </div>
                )}

                {puesto.ubicacion && (
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Ubicación
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {puesto.ubicacion}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Sistema */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Información del Sistema
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Tipo de Entidad
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Puesto de Extintor
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Código
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {puesto.codigo || 'No disponible'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Estado de Asignación
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {puesto.extintor ? 'Con Extintor' : 'Sin Extintor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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

export default PuestoDetailPage;
