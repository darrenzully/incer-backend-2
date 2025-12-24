import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PhoneIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { clienteService, Cliente, TipoDeCliente, TipoDeServicio, Center, User, TipoProducto, Periodicidad, ClienteAlcance } from '../services/clienteService';
import Notification from '../components/Notification';

const ClientFormPage: React.FC = () => {
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
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nombre: '',
    cuit: '',
    telefono: '',
    razonSocial: '',
    tipoDeClienteId: 0,
    tipoDeServicioId: 0,
    centroId: 0,
    vendedorId: 0,
    activo: true
  });

  // Available options
  const [tiposCliente, setTiposCliente] = useState<TipoDeCliente[]>([]);
  const [tiposServicio, setTiposServicio] = useState<TipoDeServicio[]>([]);
  const [tiposProducto, setTiposProducto] = useState<TipoProducto[]>([]);

  const [periodicidades, setPeriodicidades] = useState<Periodicidad[]>([]);
  const [centros, setCentros] = useState<Center[]>([]);
  const [vendedores, setVendedores] = useState<User[]>([]);

  // Alcances management
  const [alcances, setAlcances] = useState<ClienteAlcance[]>([]);
  const [nuevoAlcance, setNuevoAlcance] = useState<Partial<ClienteAlcance>>({
    tipoDeProductoId: 0,
    periodicidadId: 0
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load available options
      const [tiposClienteData, tiposServicioData, tiposProductoData, periodicidadesData, centrosData, vendedoresData] = await Promise.all([
        clienteService.getTiposCliente(),
        clienteService.getTiposServicio(),
        clienteService.getTiposProducto(),
        clienteService.getPeriodicidades(),
        clienteService.getCentros(),
        clienteService.getVendedores()
      ]);

      setTiposCliente(tiposClienteData);
      setTiposServicio(tiposServicioData);
      setTiposProducto(tiposProductoData);

      setPeriodicidades(periodicidadesData);
      setCentros(centrosData);
      setVendedores(vendedoresData);

      // Load client data if editing
      if (isEditing && id) {
        const clienteData = await clienteService.getCliente(parseInt(id));
        setFormData(clienteData);
        if (clienteData.alcances) {
          setAlcances(clienteData.alcances);
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

  const handleAlcanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const intValue = parseInt(value);
    
    setNuevoAlcance(prev => ({
      ...prev,
      [name]: intValue
    }));


  };

  const handleAddAlcance = () => {
    if (nuevoAlcance.tipoDeProductoId && nuevoAlcance.periodicidadId) {
      const alcance: ClienteAlcance = {
        id: Date.now(), // Temporal ID for frontend
        clienteId: 0,
        tipoDeProductoId: nuevoAlcance.tipoDeProductoId,
        periodicidadId: nuevoAlcance.periodicidadId,
        tipoDeElementoId: undefined,
        tipoDeServicioId: undefined
      };
      
      setAlcances(prev => [...prev, alcance]);
      setNuevoAlcance({
        tipoDeProductoId: 0,
        periodicidadId: 0
      });
    }
  };

  const handleRemoveAlcance = (index: number) => {
    setAlcances(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const clienteData = {
        ...formData,
        alcances: alcances
      };
      
      if (isEditing && id) {
        await clienteService.updateCliente(parseInt(id), clienteData);
        setNotification({
          type: 'success',
          message: 'Cliente actualizado correctamente'
        });
      } else {
        await clienteService.createCliente(clienteData as Omit<Cliente, 'id' | 'numero' | 'fechaCreacion' | 'usuarioCreacion'>);
        setNotification({
          type: 'success',
          message: 'Cliente creado correctamente'
        });
      }
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/clientes');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar el cliente'
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
                onClick={() => navigate('/clientes')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isEditing ? 'Modifica la información del cliente' : 'Completa la información del nuevo cliente'}
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
                    placeholder="Nombre del cliente"
                  />
                </div>

                {/* CUIT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CUIT *
                  </label>
                  <input
                    type="text"
                    name="cuit"
                    value={formData.cuit || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="20-12345678-9"
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

                {/* Razón Social */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    name="razonSocial"
                    value={formData.razonSocial || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Razón social"
                  />
                </div>

                {/* Tipo de Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Cliente *
                  </label>
                  <select
                    name="tipoDeClienteId"
                    value={formData.tipoDeClienteId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposCliente.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Servicio *
                  </label>
                  <select
                    name="tipoDeServicioId"
                    value={formData.tipoDeServicioId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar servicio</option>
                    {tiposServicio.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Centro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Centro *
                  </label>
                  <select
                    name="centroId"
                    value={formData.centroId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar centro</option>
                    {centros.map(centro => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendedor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vendedor *
                  </label>
                  <select
                    name="vendedorId"
                    value={formData.vendedorId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar vendedor</option>
                    {vendedores.map(vendedor => (
                      <option key={vendedor.id} value={vendedor.id}>
                        {vendedor.alias}
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
                      Cliente activo
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Alcances */}
            <div className="!bg-white dark:!bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Alcances del Cliente
              </h2>
              
              {/* Formulario para agregar alcance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Producto *
                  </label>
                  <select
                    name="tipoDeProductoId"
                    value={nuevoAlcance.tipoDeProductoId || ''}
                    onChange={handleAlcanceChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposProducto.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Periodicidad *
                  </label>
                  <select
                    name="periodicidadId"
                    value={nuevoAlcance.periodicidadId || ''}
                    onChange={handleAlcanceChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar periodicidad</option>
                    {periodicidades.map(periodicidad => (
                      <option key={periodicidad.id} value={periodicidad.id}>
                        {periodicidad.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddAlcance}
                    disabled={!nuevoAlcance.tipoDeProductoId || !nuevoAlcance.periodicidadId}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Alcance
                  </button>
                </div>
              </div>

              {/* Lista de alcances */}
              <div className="space-y-3">
                {alcances.length > 0 ? (
                  alcances.map((alcance, index) => {
                    const tipoProducto = tiposProducto.find(t => t.id === alcance.tipoDeProductoId);
                    const periodicidad = periodicidades.find(p => p.id === alcance.periodicidadId);
                    
                    return (
                      <div key={alcance.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {tipoProducto?.nombre || 'Tipo no encontrado'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Periodicidad: {periodicidad?.nombre || 'No especificada'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAlcance(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No hay alcances agregados
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/clientes')}
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

export default ClientFormPage; 