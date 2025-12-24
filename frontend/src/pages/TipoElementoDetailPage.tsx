import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  CubeIcon,
  ListBulletIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { getTipoElemento, TipoElemento } from '../services/tipoElementoService';
import Notification from '../components/Notification';

const TipoElementoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tipoElemento, setTipoElemento] = useState<TipoElemento | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadTipoElemento();
    }
  }, [id]);

  const loadTipoElemento = async () => {
    try {
      setLoading(true);
      const data = await getTipoElemento(parseInt(id!));
      setTipoElemento(data);
    } catch (error) {
      console.error('Error al cargar tipo de elemento:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del tipo de elemento'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!tipoElemento) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tipo de elemento no encontrado
          </h1>
          <button
            onClick={() => navigate('/tipos-elemento')}
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
                onClick={() => navigate('/tipos-elemento')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {tipoElemento.nombre}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Tipo de Elemento #{tipoElemento.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                tipoElemento.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {tipoElemento.activo ? 'Activo' : 'Inactivo'}
              </div>
              <button
                onClick={() => navigate(`/tipos-elemento/${tipoElemento.id}/editar`)}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información General
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Nombre
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {tipoElemento.nombre}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      ID
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      #{tipoElemento.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center">
                      {tipoElemento.activo ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {tipoElemento.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tipo
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Instalación Fija
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles */}
            {tipoElemento.detalles && tipoElemento.detalles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Detalles del Tipo de Elemento
                </h2>
                
                <div className="space-y-4">
                  {tipoElemento.detalles.map((detalle, index) => (
                    <div key={detalle.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Item
                          </label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {detalle.item}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Tipo de Dato
                          </label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {detalle.tipoDeDato?.nombre || 'No especificado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Estado y Fechas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Estado y Fechas
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  {tipoElemento.activo ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tipoElemento.activo ? 'Tipo Activo' : 'Tipo Inactivo'}
                  </span>
                </div>

                {tipoElemento.fechaCreacion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fecha de Creación
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(tipoElemento.fechaCreacion)}
                    </p>
                  </div>
                )}

                {tipoElemento.fechaUpdate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Última Actualización
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(tipoElemento.fechaUpdate)}
                    </p>
                  </div>
                )}

                {tipoElemento.usuarioCreacion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Creado por
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {tipoElemento.usuarioCreacion}
                    </p>
                  </div>
                )}

                {tipoElemento.usuarioUpdate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Actualizado por
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {tipoElemento.usuarioUpdate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Detalles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Información de Detalles
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <ListBulletIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Cantidad de Detalles
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tipoElemento.detalles?.length || 0} detalle{tipoElemento.detalles?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CubeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Categoría
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Instalación Fija
                    </p>
                  </div>
                </div>

                {tipoElemento.detalles && tipoElemento.detalles.length > 0 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Tipos de Dato Utilizados:
                    </p>
                    <div className="space-y-1">
                      {Array.from(new Set(tipoElemento.detalles.map(d => d.tipoDeDato?.nombre))).map((tipo, index) => (
                        <div key={index} className="flex items-center">
                          <DocumentTextIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {tipo || 'No especificado'}
                          </span>
                        </div>
                      ))}
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

export default TipoElementoDetailPage;
