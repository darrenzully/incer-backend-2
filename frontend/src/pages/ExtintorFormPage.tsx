import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  FireIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { extintorService, Extintor, TipoDeCarga, Capacidad, Fabricante } from '../services/extintorService';
import { sucursalService } from '../services/sucursalService';
import { clienteService } from '../services/clienteService';
import Notification from '../components/Notification';

const ExtintorFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [extintor, setExtintor] = useState<Partial<Extintor>>({
    activo: true,
    orden: 1,
    reserva: false,
    baja: false,
    vencimientoCarga: new Date().toISOString().split('T')[0],
    vencimientoPH: new Date().toISOString().split('T')[0],
    incorporacion: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Datos de opciones
  const [tiposCarga, setTiposCarga] = useState<TipoDeCarga[]>([]);
  const [capacidades, setCapacidades] = useState<Capacidad[]>([]);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de opciones
      const [tiposData, capacidadesData, fabricantesData, sucursalesData, clientesData] = await Promise.all([
        extintorService.getTiposCarga(),
        extintorService.getCapacidades(),
        extintorService.getFabricantes(),
        sucursalService.getAll(),
        clienteService.getClientes()
      ]);

      setTiposCarga(tiposData);
      setCapacidades(capacidadesData);
      setFabricantes(fabricantesData);
      setSucursales(sucursalesData);
      setClientes(clientesData);

      // Si estamos editando, cargar los datos del extintor
      if (isEdit && id) {
        try {
          const extintorData = await extintorService.getById(Number(id));
          setExtintor({
            ...extintorData,
            vencimientoCarga: extintorData.vencimientoCarga ? extintorData.vencimientoCarga.split('T')[0] : '',
            vencimientoPH: extintorData.vencimientoPH ? extintorData.vencimientoPH.split('T')[0] : '',
            incorporacion: (extintorData as any).incorporacion ? (extintorData as any).incorporacion.split('T')[0] : ''
          });
        } catch (error) {
          console.error('Error al cargar extintor:', error);
          setNotification({
            type: 'error',
            message: 'Error al cargar el extintor'
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
      setExtintor({ ...extintor, [name]: checked });
    } else if (type === 'number') {
      setExtintor({ ...extintor, [name]: Number(value) });
    } else {
      setExtintor({ ...extintor, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (isEdit && id) {
        await extintorService.update(Number(id), extintor);
        setNotification({
          type: 'success',
          message: 'Extintor actualizado correctamente'
        });
      } else {
        await extintorService.create(extintor as Omit<Extintor, 'id'>);
        setNotification({
          type: 'success',
          message: 'Extintor creado correctamente'
        });
      }
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/extintores');
      }, 1500);
      
    } catch (error) {
      console.error('Error al guardar extintor:', error);
      setNotification({
        type: 'error',
        message: `Error al ${isEdit ? 'actualizar' : 'crear'} el extintor`
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/extintores')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEdit ? 'Editar Extintor' : 'Nuevo Extintor'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {isEdit ? 'Modifica los datos del extintor' : 'Completa los datos del nuevo extintor'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FireIcon className="w-5 h-5 mr-2" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={extintor.codigo || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="EXT-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Serie
                  </label>
                  <input
                    type="text"
                    name="nroSerie"
                    value={extintor.nroSerie || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="SN001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Carga *
                  </label>
                  <select
                    name="tipoDeCargaId"
                    value={extintor.tipoDeCargaId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar tipo de carga</option>
                    {tiposCarga.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacidad *
                  </label>
                  <select
                    name="capacidadId"
                    value={extintor.capacidadId || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar capacidad</option>
                    {capacidades.map(cap => (
                      <option key={cap.id} value={cap.id}>
                        {cap.valor} {cap.unidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={extintor.ubicacion || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Planta Baja - Recepción"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    name="orden"
                    value={extintor.orden || 1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Fechas Importantes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vencimiento Carga *
                  </label>
                  <input
                    type="date"
                    name="vencimientoCarga"
                    value={extintor.vencimientoCarga || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vencimiento PH *
                  </label>
                  <input
                    type="date"
                    name="vencimientoPH"
                    value={extintor.vencimientoPH || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Incorporación *
                  </label>
                  <input
                    type="date"
                    name="incorporacion"
                    value={extintor.incorporacion || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Información del Fabricante */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Información del Fabricante
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fabricante
                  </label>
                  <select
                    name="fabricanteId"
                    value={extintor.fabricanteId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar fabricante</option>
                    {fabricantes.map(fab => (
                      <option key={fab.id} value={fab.id}>
                        {fab.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Fabricante
                  </label>
                  <input
                    type="text"
                    name="nroFabricante"
                    value={extintor.nroFabricante || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="FAB001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Año
                  </label>
                  <input
                    type="number"
                    name="año"
                    value={extintor.año || ''}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="2023"
                  />
                </div>
              </div>
            </div>

            {/* Relaciones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Relaciones
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sucursal
                  </label>
                  <select
                    name="sucursalId"
                    value={extintor.sucursalId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map(suc => (
                      <option key={suc.id} value={suc.id}>
                        {suc.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente
                  </label>
                  <select
                    name="clienteId"
                    value={extintor.clienteId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cli => (
                      <option key={cli.id} value={cli.id}>
                        {cli.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estados
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={extintor.activo || false}
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
                    name="reserva"
                    checked={extintor.reserva || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Reserva
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="baja"
                    checked={extintor.baja || false}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Baja
                  </label>
                </div>
              </div>

              {extintor.baja && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observación de Baja
                  </label>
                  <textarea
                    name="observacionBaja"
                    value={extintor.observacionBaja || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Motivo de la baja..."
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/extintores')}
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

export default ExtintorFormPage;
