import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  getRemitoById,
  createRemito,
  updateRemito,
  Remito,
  RemitoCreateRequest,
  RemitoUpdateRequest
} from '../services/remitoService';
import { useUsers } from '../hooks/useSecurity';
import { securityService, User } from '../services/securityService';
import { sucursalService } from '../services/sucursalService';
import { getPresupuestos, Presupuesto as PresupuestoFromService } from '../services/presupuestoService';
import Notification from '../components/Notification';

// interface User {
//   id: number;
//   alias: string;
//   mail: string;
//   roleId: number;
//   role?: {
//     id: number;
//     name: string;
//     description?: string;
//   };
//   activo: boolean;
// }

interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  activo: boolean;
}

type Presupuesto = PresupuestoFromService;

const RemitoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [remito, setRemito] = useState<Remito | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [presupuestosAsociados, setPresupuestosAsociados] = useState<Presupuesto[]>([]);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    numero: '',
    descripcion: '',
    estadoRemito: 'Pendiente',
    choferId: 0,
    sucursalId: 0,
    presupuestoId: 0,
    observaciones: '',
    remitoUsuarioId: 0,
    noFacturable: false,
    fechaRemitoOficial: '',
    numeroRemitoOficial: '',
    fechaFactura: '',
    numeroFactura: '',
    remitoManualFile: null as File | null,
    remitoOficialFile: null as File | null
  });

  useEffect(() => {
    loadRelatedData();
    if (isEdit && id) {
      loadRemito(parseInt(id));
    }
  }, [isEdit, id]);

  const loadRelatedData = async () => {
    try {
      const [usuariosData, sucursalesData, presupuestosData] = await Promise.all([
        securityService.getUsers(),
        sucursalService.getAll(),
        getPresupuestos()
      ]);
      
      setUsuarios(usuariosData);
      setSucursales(sucursalesData);
      setPresupuestos(presupuestosData);
    } catch (error) {
      console.error('Error al cargar datos relacionados:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos necesarios'
      });
    }
  };

  const loadRemito = async (remitoId: number) => {
    try {
      setLoading(true);
      const data = await getRemitoById(remitoId);
      setRemito(data);
      setFormData({
        fecha: data.fecha.split('T')[0],
        numero: data.numero.toString(),
        descripcion: data.descripcion || '',
        estadoRemito: data.estadoRemito.toString(),
        choferId: data.choferId,
        sucursalId: data.sucursalId,
        presupuestoId: data.presupuestoId || 0,
        observaciones: data.observaciones || '',
        remitoUsuarioId: data.remitoUsuarioId || 0,
        noFacturable: data.noFacturable,
        fechaRemitoOficial: data.fechaRemitoOficial ? data.fechaRemitoOficial.split('T')[0] : '',
        numeroRemitoOficial: data.numeroRemitoOficial?.toString() || '',
        fechaFactura: data.fechaFactura ? data.fechaFactura.split('T')[0] : '',
        numeroFactura: data.numeroFactura?.toString() || '',
        remitoManualFile: null,
        remitoOficialFile: null
      });
    } catch (error) {
      console.error('Error al cargar remito:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar el remito'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const handleAgregarPresupuesto = () => {
    if (formData.presupuestoId && formData.presupuestoId > 0) {
      const presupuestoSeleccionado = presupuestos.find(p => p.id === formData.presupuestoId);
      if (presupuestoSeleccionado && !presupuestosAsociados.find(p => p.id === presupuestoSeleccionado.id)) {
        setPresupuestosAsociados(prev => [...prev, presupuestoSeleccionado]);
        setFormData(prev => ({ ...prev, presupuestoId: 0 }));
      }
    }
  };

  const handleEliminarPresupuesto = (presupuestoId: number) => {
    setPresupuestosAsociados(prev => prev.filter(p => p.id !== presupuestoId));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.choferId || !formData.sucursalId) {
      setNotification({
        type: 'error',
        message: 'El chofer y la sucursal son requeridos'
      });
      return;
    }

    try {
      setLoading(true);

      if (isEdit && remito) {
        const updateData: RemitoUpdateRequest = {
          id: remito.id,
          fecha: formData.fecha,
          numero: parseInt(formData.numero),
          descripcion: formData.descripcion || undefined,
          estadoRemito: parseInt(formData.estadoRemito) as any,
          choferId: formData.choferId,
          sucursalId: formData.sucursalId,
          presupuestoId: formData.presupuestoId || undefined,
          observaciones: formData.observaciones || undefined,
          remitoUsuarioId: formData.remitoUsuarioId || undefined,
          noFacturable: formData.noFacturable,
          fechaRemitoOficial: formData.fechaRemitoOficial || undefined,
          numeroRemitoOficial: formData.numeroRemitoOficial ? parseInt(formData.numeroRemitoOficial) : undefined,
          fechaFactura: formData.fechaFactura || undefined,
          numeroFactura: formData.numeroFactura ? parseInt(formData.numeroFactura) : undefined
        };

        await updateRemito(remito.id, updateData);
        setNotification({
          type: 'success',
          message: 'Remito actualizado correctamente'
        });
      } else {
        const createData: RemitoCreateRequest = {
          fecha: formData.fecha,
          numero: parseInt(formData.numero),
          descripcion: formData.descripcion || undefined,
          estadoRemito: parseInt(formData.estadoRemito) as any,
          choferId: formData.choferId,
          sucursalId: formData.sucursalId,
          presupuestoId: formData.presupuestoId || undefined,
          observaciones: formData.observaciones || undefined,
          remitoUsuarioId: formData.remitoUsuarioId || undefined,
          noFacturable: formData.noFacturable,
          fechaRemitoOficial: formData.fechaRemitoOficial || undefined,
          numeroRemitoOficial: formData.numeroRemitoOficial ? parseInt(formData.numeroRemitoOficial) : undefined,
          fechaFactura: formData.fechaFactura || undefined,
          numeroFactura: formData.numeroFactura ? parseInt(formData.numeroFactura) : undefined
        };

        const newRemito = await createRemito(createData);
        setNotification({
          type: 'success',
          message: 'Remito creado correctamente'
        });
        navigate(`/remitos/${newRemito.id}`);
      }
    } catch (error) {
      console.error('Error al guardar remito:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar el remito'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/remitos');
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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
              {isEdit ? 'Editar Remito' : 'Nuevo Remito'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica la información del remito' : 'Crea un nuevo remito de entrega'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información del Remito
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Número */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número *
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cliente
              </label>
              <input
                type="text"
                value={remito?.sucursal?.cliente?.nombre || 'N/A'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                disabled
              />
            </div>

            {/* Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sucursal *
              </label>
              <select
                name="sucursalId"
                value={formData.sucursalId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={0}>Seleccionar sucursal</option>
                {sucursales.map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Chofer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chofer *
              </label>
              <select
                name="choferId"
                value={formData.choferId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={0}>Seleccionar chofer</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.alias}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                name="estadoRemito"
                value={formData.estadoRemito}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            {/* Firma del Operador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Firma del Operador
              </label>
              {remito?.firmaOperador ? (
                <div className="flex items-center space-x-2">
                  <a
                    href={`/api/remitos/${remito.id}/firma-operador`}
                    className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Descargar imagen
                  </a>
                </div>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Sin firma</span>
              )}
            </div>

            {/* Firma del Encargado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Firma del Encargado
              </label>
              {remito?.firmaEncargado ? (
                <div className="flex items-center space-x-2">
                  <a
                    href={`/api/remitos/${remito.id}/firma-encargado`}
                    className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Descargar imagen
                  </a>
                </div>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Sin firma</span>
              )}
            </div>

            {/* Remito Manual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remito Manual
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  name="remitoManualFile"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {remito?.remitoManual && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {remito.remitoManual.nombre || 'RemitoManual.png'}
                    </span>
                    <a
                      href={`/api/archivos/${remito.remitoManual.id}/download`}
                      className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Descargar archivo
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Remito Oficial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remito Oficial
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  name="remitoOficialFile"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                {remito?.remitoOficial && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {remito.remitoOficial.nombre || 'RemitoOficial.png'}
                    </span>
                    <a
                      href={`/api/archivos/${remito.remitoOficial.id}/download`}
                      className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      Descargar archivo
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Fecha Remito Oficial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Remito Oficial
              </label>
              <input
                type="date"
                name="fechaRemitoOficial"
                value={formData.fechaRemitoOficial}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Nro. Remito Oficial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nro. Remito Oficial
              </label>
              <input
                type="text"
                name="numeroRemitoOficial"
                value={formData.numeroRemitoOficial}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Fecha Factura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha Factura
              </label>
              <input
                type="date"
                name="fechaFactura"
                value={formData.fechaFactura}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Nro. Factura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nro. Factura
              </label>
              <input
                type="text"
                name="numeroFactura"
                value={formData.numeroFactura}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* No Facturable */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="noFacturable"
                  checked={formData.noFacturable}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  No facturable
                </span>
              </label>
            </div>

            {/* Observaciones */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Clientes Asociados */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clientes Asociados
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <select
                    name="presupuestoId"
                    value={formData.presupuestoId}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value={0}>Seleccione un presupuesto</option>
                    {presupuestos
                      .filter(p => !presupuestosAsociados.find(pa => pa.id === p.id))
                      .map(presupuesto => (
                        <option key={presupuesto.id} value={presupuesto.id}>
                          {presupuesto.numero} - {presupuesto.descripcion || 'Sin descripción'}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAgregarPresupuesto}
                    className="px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    + Agregar
                  </button>
                </div>
                
                {presupuestosAsociados.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Número
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {presupuestosAsociados.map((presupuesto) => (
                          <tr key={presupuesto.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {presupuesto.numero}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {presupuesto.descripcion || 'Sin descripción'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {new Date(presupuesto.fecha).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                presupuesto.estado === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                presupuesto.estado === 2 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                presupuesto.estado === 3 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {presupuesto.estado === 1 ? 'Pendiente' :
                                 presupuesto.estado === 2 ? 'Aprobado' :
                                 presupuesto.estado === 3 ? 'Completado' : 'Cancelado'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handleEliminarPresupuesto(presupuesto.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No data available in table
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <XCircleIcon className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RemitoFormPage;
