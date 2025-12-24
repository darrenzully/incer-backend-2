import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  CubeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { elementoService, Elemento } from '../services/elementoService';
import { sucursalService } from '../services/sucursalService';
import { getTiposElemento } from '../services/tipoElementoService';
import Notification from '../components/Notification';

const ElementoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [elemento, setElemento] = useState<Elemento>({
    id: 0,
    tipoDeElementoId: 0,
    sucursalId: 0,
    ubicacion: '',
    codigo: '',
    interno: 0,
    activo: true
  });

  const [sucursales, setSucursales] = useState<any[]>([]);
  const [tiposElemento, setTiposElemento] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de opciones
      const [sucursalesData, tiposElementoData] = await Promise.all([
        sucursalService.getAll(),
        getTiposElemento()
      ]);

      setSucursales(sucursalesData);
      setTiposElemento(tiposElementoData);

      // Si estamos editando, cargar los datos del elemento
      if (isEdit && id) {
        try {
          const elementoData = await elementoService.getById(Number(id));
          setElemento(elementoData);
        } catch (error) {
          console.error('Error al cargar elemento:', error);
          setNotification({
            type: 'error',
            message: 'Error al cargar la instalación fija'
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setElemento({ ...elemento, [name]: checked });
    } else if (type === 'number') {
      setElemento({ ...elemento, [name]: Number(value) });
    } else {
      setElemento({ ...elemento, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEdit && id) {
        await elementoService.update(Number(id), elemento);
        setNotification({
          type: 'success',
          message: 'Instalación fija actualizada correctamente'
        });
      } else {
        await elementoService.create(elemento as Omit<Elemento, 'id'>);
        setNotification({
          type: 'success',
          message: 'Instalación fija creada correctamente'
        });
      }
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/elementos');
      }, 1500);
      
    } catch (error) {
      console.error('Error al guardar elemento:', error);
      setNotification({
        type: 'error',
        message: `Error al ${isEdit ? 'actualizar' : 'crear'} la instalación fija`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      await elementoService.delete(Number(id));
      setNotification({
        type: 'success',
        message: 'Instalación fija eliminada correctamente'
      });
      setTimeout(() => {
        navigate('/elementos');
      }, 1500);
    } catch (error) {
      console.error('Error al eliminar elemento:', error);
      setNotification({
        type: 'error',
        message: 'Error al eliminar la instalación fija'
      });
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Editar Instalación Fija' : 'Nueva Instalación Fija'}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isEdit ? 'Modifica la información de la instalación fija' : 'Crea una nueva instalación fija en el sistema'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Información de la Instalación Fija
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={elemento.codigo || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Código de la instalación..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número Interno *
                  </label>
                  <input
                    type="number"
                    name="interno"
                    value={elemento.interno || ''}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Número interno..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Elemento *
                  </label>
                  <select
                    name="tipoDeElementoId"
                    value={elemento.tipoDeElementoId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {tiposElemento.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sucursal *
                  </label>
                  <select
                    name="sucursalId"
                    value={elemento.sucursalId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <textarea
                  name="ubicacion"
                  value={elemento.ubicacion || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Descripción de la ubicación..."
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Estado
              </h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={elemento.activo || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Activo
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              {isEdit && (
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={saving}
                  className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/elementos')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckIcon className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que quieres eliminar la instalación fija "{elemento.codigo || elemento.interno}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ElementoFormPage;
