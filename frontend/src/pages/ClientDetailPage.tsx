import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  PencilIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PhoneIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { clienteService, Cliente } from '../services/clienteService';
import Notification from '../components/Notification';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadCliente();
    }
  }, [id]);

  const loadCliente = async () => {
    try {
      setLoading(true);
      const data = await clienteService.getCliente(parseInt(id!));
      setCliente(data);
    } catch (error) {
      console.error('Error al cargar cliente:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del cliente'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCUIT = (cuit: string) => {
    if (cuit.length === 11) {
      return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
    }
    return cuit;
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

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cliente no encontrado
          </h1>
          <button
            onClick={() => navigate('/clientes')}
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
                onClick={() => navigate('/clientes')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {cliente.nombre}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Cliente #{cliente.numero}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                cliente.activo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </div>
              <button
                onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
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
                      Nombre
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {cliente.nombre}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      CUIT
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {formatCUIT(cliente.cuit)}
                    </p>
                  </div>

                  {cliente.telefono && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Teléfono
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {cliente.telefono}
                      </p>
                    </div>
                  )}

                  {cliente.razonSocial && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Razón Social
                      </label>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        {cliente.razonSocial}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tipo de Cliente
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {cliente.tipoDeCliente?.nombre || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Tipo de Servicio
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {cliente.tipoDeServicio?.nombre || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Centro
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {cliente.centro?.nombre || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Vendedor
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {cliente.vendedor?.alias || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alcances */}
            {cliente.alcances && cliente.alcances.length > 0 && (
              <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Alcances
                </h2>
                
                <div className="space-y-4">
                  {cliente.alcances.map((alcance, index) => (
                                          <div key={alcance.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Tipo de Producto
                            </label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {alcance.tipoDeProducto?.nombre || 'No especificado'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Periodicidad
                            </label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {alcance.periodicidad?.nombre || 'No especificado'}
                            </p>
                          </div>
                        {alcance.tipoDeElemento && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Tipo de Elemento
                            </label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {alcance.tipoDeElemento.nombre}
                            </p>
                          </div>
                        )}
                        {alcance.tipoDeServicio && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Tipo de Servicio
                            </label>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {alcance.tipoDeServicio.nombre}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archivos */}
            {cliente.archivos && cliente.archivos.length > 0 && (
              <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Archivos
                </h2>
                
                <div className="space-y-3">
                  {cliente.archivos.map((archivo) => (
                    <div key={archivo.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {archivo.nombre}
                          </p>
                          {archivo.descripcion && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {archivo.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {(archivo.tamaño / 1024 / 1024).toFixed(2)} MB
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
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Estado y Fechas
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  {cliente.activo ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {cliente.activo ? 'Cliente Activo' : 'Cliente Inactivo'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Fecha de Creación
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(cliente.fechaCreacion)}
                  </p>
                </div>

                {cliente.fechaUpdate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Última Actualización
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(cliente.fechaUpdate)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Creado por
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {cliente.usuarioCreacion}
                  </p>
                </div>

                {cliente.usuarioUpdate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Actualizado por
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {cliente.usuarioUpdate}
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
                <div className="flex items-center">
                  <UserGroupIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Vendedor Asignado
                    </p>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cliente.vendedor?.alias || 'No asignado'}
                      </p>
                  </div>
                </div>

                {cliente.telefono && (
                  <div className="flex items-center">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Teléfono
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cliente.telefono}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Centro
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cliente.centro?.nombre || 'No asignado'}
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

export default ClientDetailPage; 