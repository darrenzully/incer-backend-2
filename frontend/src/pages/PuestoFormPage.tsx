import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { puestoService, Puesto } from '../services/puestoService';
import { sucursalService } from '../services/sucursalService';
import { extintorService } from '../services/extintorService';
import Notification from '../components/Notification';

const PuestoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [puesto, setPuesto] = useState<Puesto>({
    id: 0,
    sucursalId: 0,
    extintorId: undefined,
    nombre: '',
    ubicacion: '',
    codigo: '',
    deshabilitado: false,
    activo: true
  });

  const [sucursales, setSucursales] = useState<any[]>([]);
  const [extintores, setExtintores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const [sucursalesData, extintoresData] = await Promise.all([
        sucursalService.getAll(),
        extintorService.getAll()
      ]);

      setSucursales(sucursalesData);
      setExtintores(extintoresData);

      // Si estamos editando, cargar los datos del puesto
      if (isEdit && id) {
        try {
          const puestoData = await puestoService.getById(Number(id));
          setPuesto(puestoData);
        } catch (error) {
          console.error('Error al cargar puesto:', error);
          setNotification({
            type: 'error',
            message: 'Error al cargar el puesto'
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
      setPuesto({ ...puesto, [name]: checked });
    } else if (type === 'number') {
      setPuesto({ ...puesto, [name]: Number(value) });
    } else {
      setPuesto({ ...puesto, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEdit && id) {
        await puestoService.update(Number(id), puesto);
        setNotification({
          type: 'success',
          message: 'Puesto actualizado correctamente'
        });
      } else {
        await puestoService.create(puesto as Omit<Puesto, 'id'>);
        setNotification({
          type: 'success',
          message: 'Puesto creado correctamente'
        });
      }
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/puestos');
      }, 1500);
      
    } catch (error) {
      console.error('Error al guardar puesto:', error);
      setNotification({
        type: 'error',
        message: `Error al ${isEdit ? 'actualizar' : 'crear'} el puesto`
      });
    } finally {
      setSaving(false);
    }
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
                {isEdit ? 'Editar Puesto' : 'Nuevo Puesto'}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isEdit ? 'Modifica la información del puesto' : 'Crea un nuevo puesto en el sistema'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-8 h-8 text-primary-500" />
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
                Información del Puesto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={puesto.codigo || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Código del puesto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={puesto.nombre || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Nombre del puesto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sucursal *
                  </label>
                  <select
                    name="sucursalId"
                    value={puesto.sucursalId || ''}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Extintor
                  </label>
                  <select
                    name="extintorId"
                    value={puesto.extintorId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Sin extintor asignado</option>
                    {extintores.map((extintor) => (
                      <option key={extintor.id} value={extintor.id}>
                        {extintor.codigo || extintor.nroSerie || `Extintor ${extintor.id}`}
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
                  value={puesto.ubicacion || ''}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={puesto.activo || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Activo
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="deshabilitado"
                    checked={puesto.deshabilitado || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Deshabilitado
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/puestos')}
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

export default PuestoFormPage;
