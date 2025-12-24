import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { sucursalService, Sucursal } from '../services/sucursalService';
import Notification from '../components/Notification';

const SucursalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const loadSucursal = useCallback(async () => {
    try {
      setLoading(true);
      const data = await sucursalService.getById(parseInt(id!));
      setSucursal(data);
    } catch (error) {
      console.error('Error al cargar sucursal:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos de la sucursal'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadSucursal();
    }
  }, [id, loadSucursal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!sucursal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sucursal no encontrada
          </h1>
          <button
            onClick={() => navigate('/sucursales')}
            className="text-primary-500 hover:text-primary-600"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/sucursales')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {sucursal.nombre}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Sucursal #{sucursal.id}
                </p>
                {sucursal.cliente && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Cliente: {sucursal.cliente.nombre}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                sucursal.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {sucursal.activo ? 'Activa' : 'Inactiva'}
              </div>
              <button
                onClick={() => navigate(`/sucursales/edit/${sucursal.id}`)}
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
                      Nombre de la Sucursal
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {sucursal.nombre}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      ID de la Sucursal
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {sucursal.id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center">
                      {sucursal.activo ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {sucursal.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {sucursal.cliente && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Cliente
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {sucursal.cliente.nombre}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {sucursal.cliente.id}
                      </p>
                    </div>
                  )}

                  {sucursal.direccion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Dirección
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {sucursal.direccion}
                      </p>
                    </div>
                  )}

                  {sucursal.telefono && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Teléfono
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {sucursal.telefono}
                      </p>
                    </div>
                  )}

                  {sucursal.mail && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Email
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {sucursal.mail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Ubicación
              </h2>
              
              <div className="space-y-4">
                {sucursal.localidad && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Localidad
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {sucursal.localidad.nombre}
                      </p>
                    </div>

                    {sucursal.localidad.provincia && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Provincia
                        </label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {sucursal.localidad.provincia.nombre}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Código: {sucursal.localidad.provincia.codigo}
                        </p>
                      </div>
                    )}

                    {sucursal.localidad.provincia?.paisId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          País
                        </label>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          Argentina
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {sucursal.mapaDePuestos && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Mapa de Puestos
                    </label>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {sucursal.mapaDePuestos}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información Adicional
              </h2>
              
              <div className="text-center py-8">
                <MapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Información adicional de la sucursal estará disponible en futuras versiones
                </p>
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
            {/* Estado y Cliente */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Estado y Cliente
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  {sucursal.activo ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {sucursal.activo ? 'Sucursal Activa' : 'Sucursal Inactiva'}
                  </span>
                </div>

                {sucursal.cliente && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Cliente Asignado
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {sucursal.cliente.nombre}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {sucursal.cliente.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Información de Contacto
              </h3>
              
              <div className="space-y-4">
                {sucursal.direccion && (
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Dirección
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sucursal.direccion}
                      </p>
                    </div>
                  </div>
                )}

                {sucursal.telefono && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Teléfono
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sucursal.telefono}
                      </p>
                    </div>
                  </div>
                )}

                {sucursal.mail && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Email
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {sucursal.mail}
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
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Tipo de Entidad
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sucursal de Cliente
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Ubicación
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sucursal.localidad?.nombre || 'No especificada'}
                    </p>
                  </div>
                </div>

                {sucursal.mapaDePuestos && (
                  <div className="flex items-center">
                    <MapIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Mapa de Puestos
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Disponible
                      </p>
                    </div>
                  </div>
                )}
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

export default SucursalDetailPage;
