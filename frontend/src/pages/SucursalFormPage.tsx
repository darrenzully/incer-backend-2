import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { sucursalService, Sucursal, Localidad, Provincia, Pais } from '../services/sucursalService';
import Notification from '../components/Notification';

const SucursalFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Form data
  const [formData, setFormData] = useState<Partial<Sucursal>>({
    nombre: '',
    direccion: '',
    telefono: '',
    mail: '',
    activo: true,
    clienteId: 0,
    localidadId: 0
  });

  // Available options
  const [paises, setPaises] = useState<Pais[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load available options
      const [paisesData, clientesData] = await Promise.all([
        sucursalService.getPaises(),
        sucursalService.getClientes()
      ]);
      
      setPaises(paisesData);
      setClientes(clientesData);

      // Load sucursal data if editing
      if (isEditing && id) {
        const sucursalData = await sucursalService.getById(parseInt(id));
        setFormData(sucursalData);
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

  const handleProvinciaChange = async (paisId: number) => {
    try {
      const provinciasData = await sucursalService.getProvinciasByPais(paisId);
      setProvincias(provinciasData);
      setFormData(prev => ({ ...prev, localidadId: 0 }));
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al cargar provincias' });
    }
  };

  const handleLocalidadChange = async (provinciaId: number) => {
    try {
      const localidadesData = await sucursalService.getLocalidadesByProvincia(provinciaId);
      setLocalidades(localidadesData);
      setFormData(prev => ({ ...prev, localidadId: 0 }));
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al cargar localidades' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEditing && id) {
        await sucursalService.update(parseInt(id), formData);
        setNotification({
          type: 'success',
          message: 'Sucursal actualizada correctamente'
        });
      } else {
        await sucursalService.create(formData as Omit<Sucursal, 'id'>);
        setNotification({
          type: 'success',
          message: 'Sucursal creada correctamente'
        });
      }
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/sucursales');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la sucursal'
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
            <div className="flex items-center">
              <button
                onClick={() => navigate('/sucursales')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Editar Sucursal' : 'Nueva Sucursal'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isEditing ? 'Modifica la información de la sucursal' : 'Completa la información de la nueva sucursal'}
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
                <div>
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
                    placeholder="Nombre de la sucursal"
                  />
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente *
                  </label>
                  <select
                    name="clienteId"
                    value={formData.clienteId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Dirección de la sucursal"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="mail"
                    value={formData.mail || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="sucursal@empresa.com"
                  />
                </div>

                {/* País */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    País
                  </label>
                  <select
                    onChange={(e) => handleProvinciaChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar país</option>
                    {paises.map(pais => (
                      <option key={pais.id} value={pais.id}>
                        {pais.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Provincia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provincia
                  </label>
                  <select
                    onChange={(e) => handleLocalidadChange(parseInt(e.target.value))}
                    disabled={!paises.length}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar provincia</option>
                    {provincias.map(provincia => (
                      <option key={provincia.id} value={provincia.id}>
                        {provincia.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Localidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localidad *
                  </label>
                  <select
                    name="localidadId"
                    value={formData.localidadId || ''}
                    onChange={handleChange}
                    required
                    disabled={!provincias.length}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar localidad</option>
                    {localidades.map(localidad => (
                      <option key={localidad.id} value={localidad.id}>
                        {localidad.nombre}
                      </option>
                    ))}
                  </select>
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
                      Sucursal activa
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/sucursales')}
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

export default SucursalFormPage; 