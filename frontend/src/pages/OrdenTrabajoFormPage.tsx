import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  XMarkIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { 
  ordenTrabajoService, 
  OrdenDeTrabajoCreateRequest, 
  OrdenDeTrabajoUpdateRequest,
  Sucursal,
  Usuario,
  Prioridad,
  EstadoDeOT,
  Remito
} from '../services/ordenTrabajoService';
import { clienteService, Cliente } from '../services/clienteService';
import Notification from '../components/Notification';

const OrdenTrabajoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<OrdenDeTrabajoCreateRequest>({
    sucursalId: 0,
    numero: 0,
    usuarioId: 0,
    prioridadId: 0,
    estadoDeOTId: 0,
    fechaIngreso: new Date().toISOString().split('T')[0],
    fechaRecepcion: '',
    fechaTerminacion: '',
    fechaSalida: '',
    fechaEntrega: '',
    remitoId: 0,
    observaciones: ''
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [estados, setEstados] = useState<EstadoDeOT[]>([]);
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type?: 'success' | 'error' | 'info' } | null>(null);

  const loadDropdownData = async () => {
    try {
      const [clientesData, sucursalesData, usuariosData, prioridadesData, estadosData, remitosData] = await Promise.all([
        clienteService.getClientes(),
        ordenTrabajoService.getSucursales(),
        ordenTrabajoService.getUsuarios(),
        ordenTrabajoService.getPrioridades(),
        ordenTrabajoService.getEstadosDeOT(),
        ordenTrabajoService.getRemitos()
      ]);

      setClientes(clientesData);
      setSucursales(sucursalesData);
      setUsuarios(usuariosData);
      setPrioridades(prioridadesData);
      setEstados(estadosData);
      setRemitos(remitosData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setNotification({ message: 'Error al cargar los datos del formulario', type: 'error' });
    }
  };

  const loadOrden = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const orden = await ordenTrabajoService.getById(parseInt(id));
      setFormData({
        sucursalId: orden.sucursalId,
        numero: orden.numero,
        usuarioId: orden.usuarioId,
        prioridadId: orden.prioridadId,
        estadoDeOTId: orden.estadoDeOTId,
        fechaIngreso: orden.fechaIngreso.split('T')[0],
        fechaRecepcion: orden.fechaRecepcion?.split('T')[0] || '',
        fechaTerminacion: orden.fechaTerminacion?.split('T')[0] || '',
        fechaSalida: orden.fechaSalida?.split('T')[0] || '',
        fechaEntrega: orden.fechaEntrega?.split('T')[0] || '',
        remitoId: orden.remitoId || 0,
        observaciones: orden.observaciones || ''
      });
      // Establecer el cliente basado en la sucursal seleccionada
      if (orden.sucursal?.clienteId) {
        setSelectedClienteId(orden.sucursal.clienteId);
      }
    } catch (error) {
      console.error('Error loading orden:', error);
      setNotification({ message: 'Error al cargar la orden de trabajo', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDropdownData();
    if (isEdit) {
      loadOrden();
    } else {
      generateNumero();
    }
  }, [id, isEdit, loadOrden]);

  const generateNumero = async () => {
    try {
      const { numero } = await ordenTrabajoService.generarNumero();
      setFormData(prev => ({ ...prev, numero }));
    } catch (error) {
      console.error('Error generating numero:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sucursalId || !formData.usuarioId || !formData.prioridadId || !formData.estadoDeOTId) {
      setNotification({ message: 'Por favor completa todos los campos obligatorios', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      if (isEdit) {
        const updateData: OrdenDeTrabajoUpdateRequest = {
          id: parseInt(id!),
          ...formData,
          remitoId: formData.remitoId || undefined
        };
        await ordenTrabajoService.update(parseInt(id!), updateData);
        setNotification({ message: 'Orden de trabajo actualizada correctamente', type: 'success' });
      } else {
        await ordenTrabajoService.create({
          ...formData,
          remitoId: formData.remitoId || undefined
        });
        setNotification({ message: 'Orden de trabajo creada correctamente', type: 'success' });
      }
      
      setTimeout(() => {
        navigate('/ordenes-trabajo');
      }, 1500);
    } catch (error) {
      console.error('Error saving orden:', error);
      setNotification({ message: 'Error al guardar la orden de trabajo', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Id') ? (value ? parseInt(value) : 0) : value
    }));
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = parseInt(e.target.value);
    setSelectedClienteId(clienteId);
    // Reset sucursal when cliente changes
    setFormData(prev => ({
      ...prev,
      sucursalId: 0
    }));
  };

  // Filtrar sucursales por cliente seleccionado
  const filteredSucursales = selectedClienteId > 0 
    ? sucursales.filter(sucursal => sucursal.clienteId === selectedClienteId)
    : sucursales;

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/ordenes-trabajo')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <ClipboardDocumentListIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica los datos de la orden de trabajo' : 'Crea una nueva orden de trabajo'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número *
              </label>
              <input
                type="number"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* 2. Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cliente *
              </label>
              <select
                value={selectedClienteId}
                onChange={handleClienteChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sucursal *
              </label>
              <select
                name="sucursalId"
                value={formData.sucursalId}
                onChange={handleInputChange}
                required
                disabled={selectedClienteId === 0}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={0}>
                  {selectedClienteId === 0 ? 'Primero selecciona un cliente' : 'Seleccionar sucursal'}
                </option>
                {filteredSucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad *
              </label>
              <select
                name="prioridadId"
                value={formData.prioridadId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Seleccionar prioridad</option>
                {prioridades.map(prioridad => (
                  <option key={prioridad.id} value={prioridad.id}>
                    {prioridad.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                name="estadoDeOTId"
                value={formData.estadoDeOTId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Seleccionar estado</option>
                {estados.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuario (mantener para funcionalidad) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuario *
              </label>
              <select
                name="usuarioId"
                value={formData.usuarioId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Seleccionar usuario</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.alias}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fechas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 6. Fecha de Ingreso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  name="fechaIngreso"
                  value={formData.fechaIngreso}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* 7. Fecha de Salida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Salida
                </label>
                <input
                  type="date"
                  name="fechaSalida"
                  value={formData.fechaSalida}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* 8. Fecha de Terminación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Terminación
                </label>
                <input
                  type="date"
                  name="fechaTerminacion"
                  value={formData.fechaTerminacion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* 9. Fecha de Entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  name="fechaEntrega"
                  value={formData.fechaEntrega}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

            </div>
          </div>

          {/* Campos adicionales */}
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 10. Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Observaciones adicionales..."
                />
              </div>

              {/* 11. Remito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Remito
                </label>
                <select
                  name="remitoId"
                  value={formData.remitoId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value={0}>Sin remito</option>
                  {remitos.map(remito => (
                    <option key={remito.id} value={remito.id}>
                      {remito.letra}{remito.secuencia}{remito.numero.toString().padStart(4, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 12. Fecha de Retiro */}
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Retiro
                </label>
                <input
                  type="date"
                  name="fechaRecepcion"
                  value={formData.fechaRecepcion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/ordenes-trabajo')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 mr-2 inline" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <CheckIcon className="w-5 h-5 mr-2 inline" />
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default OrdenTrabajoFormPage;
