import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  CubeIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  TagIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { elementoService, Elemento } from '../services/elementoService';
import Notification from '../components/Notification';

const ElementoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [elemento, setElemento] = useState<Elemento | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const loadElemento = useCallback(async () => {
    try {
      setLoading(true);
      const data = await elementoService.getById(parseInt(id!));
      setElemento(data);
    } catch (error) {
      console.error('Error al cargar elemento:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del elemento'
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadElemento();
    }
  }, [id, loadElemento]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!elemento) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Elemento no encontrado
          </h1>
          <button
            onClick={() => navigate('/elementos')}
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
                onClick={() => navigate('/elementos')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Instalación Fija #{elemento.interno}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  ID: {elemento.id}
                </p>
                {elemento.codigo && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Código: {elemento.codigo}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                elemento.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {elemento.activo ? 'Activo' : 'Inactivo'}
              </div>
              <button
                onClick={() => navigate(`/elementos/edit/${elemento.id}`)}
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
                      Número Interno
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {elemento.interno}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      ID del Elemento
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {elemento.id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center">
                      {elemento.activo ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {elemento.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {elemento.tipoDeElemento && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Tipo de Elemento
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {elemento.tipoDeElemento.nombre}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {elemento.tipoDeElemento.id}
                      </p>
                    </div>
                  )}

                  {elemento.codigo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Código
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {elemento.codigo}
                      </p>
                    </div>
                  )}

                  {elemento.ubicacion && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Ubicación
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {elemento.ubicacion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles del Elemento */}
            {elemento.detalles && elemento.detalles.length > 0 && (
              <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Detalles del Elemento
                </h2>
                
                <div className="space-y-4">
                  {elemento.detalles.map((detalle) => (
                    <div key={detalle.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Detalle
                          </label>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {detalle.tipoElementoDetalle?.nombre || 'Sin nombre'}
                          </p>
                          {detalle.tipoElementoDetalle?.item && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Item: {detalle.tipoElementoDetalle.item}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Valor
                          </label>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {detalle.valor}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información Adicional */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información Adicional
              </h2>
              
              <div className="text-center py-8">
                <WrenchScrewdriverIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Información adicional del elemento estará disponible en futuras versiones
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
            {/* Estado y Tipo */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Estado y Tipo
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  {elemento.activo ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {elemento.activo ? 'Elemento Activo' : 'Elemento Inactivo'}
                  </span>
                </div>

                {elemento.tipoDeElemento && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tipo de Elemento
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {elemento.tipoDeElemento.nombre}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Número Interno
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {elemento.interno}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de Asignación */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Información de Asignación
              </h3>
              
              <div className="space-y-4">
                {elemento.sucursal && (
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Sucursal
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {elemento.sucursal.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {elemento.sucursal.id}
                      </p>
                    </div>
                  </div>
                )}

                {elemento.ubicacion && (
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Ubicación
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {elemento.ubicacion}
                      </p>
                    </div>
                  </div>
                )}

                {elemento.codigo && (
                  <div className="flex items-center">
                    <TagIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Código
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {elemento.codigo}
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
                  <CubeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Tipo de Entidad
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Instalación Fija
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <ListBulletIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Detalles
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {elemento.detalles && elemento.detalles.length > 0 
                        ? `${elemento.detalles.length} detalle(s)` 
                        : 'Sin detalles'}
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
                      {elemento.codigo || 'No disponible'}
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

export default ElementoDetailPage;
