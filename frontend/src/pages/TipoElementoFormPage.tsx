import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CubeIcon,
  ListBulletIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { 
  getTipoElemento, 
  createTipoElemento, 
  updateTipoElemento, 
  deleteTipoElemento,
  getTiposDato,
  TipoElemento, 
  TipoElementoDetalle, 
  TipoDato 
} from '../services/tipoElementoService';
import Notification from '../components/Notification';

const TipoElementoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Form data
  const [formData, setFormData] = useState<Partial<TipoElemento>>({
    nombre: '',
    activo: true,
    detalles: []
  });

  // Available options
  const [tiposDato, setTiposDato] = useState<TipoDato[]>([]);

  // Detalles management
  const [detalles, setDetalles] = useState<TipoElementoDetalle[]>([]);
  const [nuevoDetalle, setNuevoDetalle] = useState<Partial<TipoElementoDetalle>>({
    item: '',
    tipoDeDatoId: 0
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load available options
      const tiposDatoData = await getTiposDato();
      setTiposDato(tiposDatoData);

      // Load tipo elemento data if editing
      if (isEditing && id) {
        const tipoElementoData = await getTipoElemento(parseInt(id));
        setFormData(tipoElementoData);
        if (tipoElementoData.detalles) {
          setDetalles(tipoElementoData.detalles);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleDetalleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setNuevoDetalle(prev => ({
      ...prev,
      [name]: name === 'tipoDeDatoId' ? parseInt(value) : value
    }));
  };

  const handleAddDetalle = () => {
    if (nuevoDetalle.item && nuevoDetalle.tipoDeDatoId) {
      const detalle: TipoElementoDetalle = {
        id: Date.now(), // Temporal ID for frontend
        item: nuevoDetalle.item,
        tipoDeDatoId: nuevoDetalle.tipoDeDatoId,
        tipoDeElementoId: 0
      };
      
      setDetalles(prev => [...prev, detalle]);
      setNuevoDetalle({
        item: '',
        tipoDeDatoId: 0
      });
    }
  };

  const handleRemoveDetalle = (index: number) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const tipoElementoData = {
        ...formData,
        detalles: detalles
      };
      
      if (isEditing && id) {
        await updateTipoElemento(parseInt(id), tipoElementoData as TipoElemento);
        setNotification({
          type: 'success',
          message: 'Tipo de elemento actualizado correctamente'
        });
      } else {
        await createTipoElemento(tipoElementoData as Omit<TipoElemento, 'id'>);
        setNotification({
          type: 'success',
          message: 'Tipo de elemento creado correctamente'
        });
      }
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/tipos-elemento');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar tipo de elemento:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar el tipo de elemento'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      await deleteTipoElemento(parseInt(id));
      setNotification({
        type: 'success',
        message: 'Tipo de elemento eliminado correctamente'
      });
      setTimeout(() => {
        navigate('/tipos-elemento');
      }, 1500);
    } catch (error) {
      console.error('Error al eliminar tipo de elemento:', error);
      setNotification({
        type: 'error',
        message: 'Error al eliminar el tipo de elemento'
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
            <div className="flex items-center">
              <button
                onClick={() => navigate('/tipos-elemento')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Editar Tipo de Elemento' : 'Nuevo Tipo de Elemento'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isEditing ? 'Modifica la información del tipo de elemento' : 'Completa la información del nuevo tipo de elemento'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Información General
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nombre del tipo de elemento"
                  />
                </div>

                {/* Estado */}
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo || false}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-500 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de elemento activo
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Detalles del Tipo de Elemento
              </h2>
              
              {/* Formulario para agregar detalle */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item *
                  </label>
                  <input
                    type="text"
                    name="item"
                    value={nuevoDetalle.item || ''}
                    onChange={handleDetalleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nombre del item"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Dato *
                  </label>
                  <select
                    name="tipoDeDatoId"
                    value={nuevoDetalle.tipoDeDatoId || ''}
                    onChange={handleDetalleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposDato.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddDetalle}
                    disabled={!nuevoDetalle.item || !nuevoDetalle.tipoDeDatoId}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Detalle
                  </button>
                </div>
              </div>

              {/* Lista de detalles */}
              <div className="space-y-3">
                {detalles.length > 0 ? (
                  detalles.map((detalle, index) => {
                    const tipoDato = tiposDato.find(t => t.id === detalle.tipoDeDatoId);
                    
                    return (
                      <div key={detalle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {detalle.item}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tipo: {tipoDato?.nombre || 'No especificado'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDetalle(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No hay detalles agregados
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={saving}
                  className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Eliminar
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/tipos-elemento')}
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckIcon className="w-5 h-5 mr-2" />
                )}
                {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
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
              ¿Estás seguro de que quieres eliminar el tipo de elemento "{formData.nombre}"? Esta acción no se puede deshacer.
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

export default TipoElementoFormPage;
