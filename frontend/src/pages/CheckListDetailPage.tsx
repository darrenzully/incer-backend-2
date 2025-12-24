import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  getCheckListById,
  CheckList,
  CheckListDetalle,
  TipoProducto,
  TipoDato
} from '../services/checkListService';
import Notification from '../components/Notification';

const CheckListDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [checkList, setCheckList] = useState<CheckList | null>(null);
  const [detalles, setDetalles] = useState<CheckListDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadCheckList(parseInt(id));
    }
  }, [id]);

  const loadCheckList = async (checkListId: number) => {
    try {
      setLoading(true);
      const data = await getCheckListById(checkListId);
      setCheckList(data);
      setDetalles(data.detalles || []);
    } catch (error) {
      console.error('Error al cargar checklist:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar el checklist'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (checkList) {
      navigate(`/checklists/${checkList.id}/editar`);
    }
  };

  const handleBack = () => {
    navigate('/checklists');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!checkList) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Checklist no encontrado</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          El checklist que buscas no existe o ha sido eliminado.
        </p>
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver a Checklists
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

      {/* Header */}
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
              Checklist: {checkList.tipoDeProducto?.nombre || 'Sin tipo'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Versión {checkList.version} • {checkList.porDefecto ? 'Por defecto' : 'Específico'}
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

      {/* Información Básica */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Información Básica
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Producto
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {checkList.tipoDeProducto?.nombre || 'N/A'}
            </p>
          </div>

          {checkList.tipoDeElemento && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Instalación
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {checkList.tipoDeElemento.nombre}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Versión
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              v{checkList.version}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              checkList.activo 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {checkList.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Por Defecto
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              checkList.porDefecto 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {checkList.porDefecto ? 'Sí' : 'No'}
            </span>
          </div>

          {checkList.cliente && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cliente
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {checkList.cliente.nombre}
              </p>
            </div>
          )}

          {checkList.sucursal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sucursal
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {checkList.sucursal.nombre}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detalles del Checklist */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detalles del Checklist ({detalles.length})
        </h2>
        
        {detalles.length > 0 ? (
          <div className="space-y-4">
            {detalles.map((detalle, index) => (
              <div key={detalle.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                        {detalle.orden}
                      </span>
                      {detalle.titulo && (
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {detalle.titulo}
                        </h4>
                      )}
                    </div>
                    {detalle.item && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {detalle.item}
                      </p>
                    )}
                    {detalle.tipoDeDato && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                          {detalle.tipoDeDato.nombre}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Activo
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              Sin detalles
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Este checklist no tiene detalles configurados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckListDetailPage;
