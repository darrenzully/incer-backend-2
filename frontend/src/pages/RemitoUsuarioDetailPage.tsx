import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  XCircleIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import {
  getRemitoUsuarioById,
  RemitoUsuario,
  getFormattedNumeroRange,
  getTotalNumeros
} from '../services/remitoUsuarioService';
import Notification from '../components/Notification';

const RemitoUsuarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [remitoUsuario, setRemitoUsuario] = useState<RemitoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadRemitoUsuario(parseInt(id));
    }
  }, [id]);

  const loadRemitoUsuario = async (remitoUsuarioId: number) => {
    try {
      setLoading(true);
      const data = await getRemitoUsuarioById(remitoUsuarioId);
      setRemitoUsuario(data);
    } catch (error) {
      console.error('Error al cargar asignación de remitos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar la asignación de remitos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (remitoUsuario) {
      navigate(`/remito-usuarios/${remitoUsuario.id}/editar`);
    }
  };

  const handleBack = () => {
    navigate('/remito-usuarios');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!remitoUsuario) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Asignación de remitos no encontrada</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          La asignación de remitos que buscas no existe o ha sido eliminada.
        </p>
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver a Asignaciones
          </button>
        </div>
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
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Asignación de Remitos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {remitoUsuario.chofer?.alias || 'N/A'} - {getFormattedNumeroRange(remitoUsuario)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información General
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Chofer</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {remitoUsuario.chofer?.alias || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Letra</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{remitoUsuario.letra || 'No especificada'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Secuencia</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{remitoUsuario.secuencia || 'No especificada'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rango de Números</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{getFormattedNumeroRange(remitoUsuario)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <DocumentTextIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Números</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{getTotalNumeros(remitoUsuario).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detalles Adicionales
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Creado</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(remitoUsuario.fechaCreacion).toLocaleDateString('es-ES')} por {remitoUsuario.usuarioCreacion}
                  </p>
                </div>
              </div>

              {remitoUsuario.fechaUpdate && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Última actualización</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(remitoUsuario.fechaUpdate).toLocaleDateString('es-ES')} por {remitoUsuario.usuarioUpdate}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  remitoUsuario.activo 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {remitoUsuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemitoUsuarioDetailPage;
