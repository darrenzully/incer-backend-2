import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  createCheckList,
  updateCheckList,
  getCheckListById,
  getTiposProducto,
  getTiposDato,
  getTiposElemento,
  createCheckListDetalle,
  CheckList,
  CheckListDetalle,
  TipoProducto,
  TipoDato,
  TipoElemento,
  CheckListCreateRequest,
  CheckListUpdateRequest,
  CheckListDetalleCreateRequest
} from '../services/checkListService';
import { clienteService, Cliente } from '../services/clienteService';
import { sucursalService, Sucursal } from '../services/sucursalService';
import Notification from '../components/Notification';

const CheckListFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Estados principales
  const [checkList, setCheckList] = useState<CheckList | null>(null);
  const [detalles, setDetalles] = useState<CheckListDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Estados para datos relacionados
  const [tiposProducto, setTiposProducto] = useState<TipoProducto[]>([]);
  const [tiposDato, setTiposDato] = useState<TipoDato[]>([]);
  const [tiposElemento, setTiposElemento] = useState<TipoElemento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    activo: true,
    porDefecto: true, // Cambiado a true por defecto
    tipoDeProductoId: 0,
    tipoDeElementoId: 0,
    clienteId: 0,
    sucursalId: 0
  });

  // Estados para nuevo detalle
  const [nuevoDetalle, setNuevoDetalle] = useState({
    orden: 1,
    titulo: '',
    item: '',
    tipoDeDatoId: 0
  });

  useEffect(() => {
    loadRelatedData();
    if (isEdit && id) {
      loadCheckList(parseInt(id));
    }
  }, [isEdit, id]);

  const loadRelatedData = async () => {
    try {
      const [tiposProd, tiposDatoData, tiposElementoData, clientesData, sucursalesData] = await Promise.all([
        getTiposProducto(),
        getTiposDato(),
        getTiposElemento(),
        clienteService.getClientes(),
        sucursalService.getAll()
      ]);

      setTiposProducto(tiposProd);
      setTiposDato(tiposDatoData);
      setTiposElemento(tiposElementoData);
      setClientes(clientesData);
      setSucursales(sucursalesData);
      

    } catch (error) {
      console.error('Error al cargar datos relacionados:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del formulario'
      });
    }
  };

  const loadCheckList = async (checkListId: number) => {
    try {
      setLoading(true);
      const data = await getCheckListById(checkListId);
      setCheckList(data);
      setFormData({
        activo: data.activo,
        porDefecto: data.porDefecto,
        tipoDeProductoId: data.tipoDeProductoId,
        tipoDeElementoId: data.tipoDeElementoId || 0,
        clienteId: data.clienteId || 0,
        sucursalId: data.sucursalId || 0
      });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
                (name === 'tipoDeProductoId' || name === 'tipoDeElementoId' || name === 'clienteId' || name === 'sucursalId') ? parseInt(value) || 0 : value
      };
      

      
      return newData;
    });
  };

  const handleDetalleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNuevoDetalle(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const addDetalle = () => {
    if (!nuevoDetalle.titulo || !nuevoDetalle.item || !nuevoDetalle.tipoDeDatoId) {
      setNotification({
        type: 'error',
        message: 'Por favor completa todos los campos del detalle'
      });
      return;
    }

    const detalle: CheckListDetalle = {
      id: 0,
      orden: nuevoDetalle.orden,
      titulo: nuevoDetalle.titulo,
      item: nuevoDetalle.item,
      checkListId: checkList?.id || 0,
      tipoDeDatoId: nuevoDetalle.tipoDeDatoId,
      tipoDeDato: tiposDato.find(t => t.id === nuevoDetalle.tipoDeDatoId)
    };

    setDetalles(prev => [...prev, detalle]);
    setNuevoDetalle({
      orden: detalles.length + 2,
      titulo: '',
      item: '',
      tipoDeDatoId: 0
    });
  };

  const removeDetalle = (index: number) => {
    setDetalles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipoDeProductoId) {
      setNotification({
        type: 'error',
        message: 'Por favor selecciona un tipo de producto'
      });
      return;
    }

    try {
      setLoading(true);

      if (isEdit && checkList) {
        // Actualizar checklist existente
        const updateData: CheckListUpdateRequest = {
          id: checkList.id,
          activo: formData.activo,
          porDefecto: formData.porDefecto,
          tipoDeProductoId: formData.tipoDeProductoId,
          tipoDeElementoId: formData.tipoDeElementoId || undefined,
          clienteId: formData.porDefecto ? undefined : formData.clienteId || undefined,
          sucursalId: formData.porDefecto ? undefined : formData.sucursalId || undefined
        };

        await updateCheckList(checkList.id, updateData);
        setNotification({
          type: 'success',
          message: 'Checklist actualizado correctamente'
        });
      } else {
        // Crear nuevo checklist
        const createData: CheckListCreateRequest = {
          activo: formData.activo,
          porDefecto: formData.porDefecto,
          tipoDeProductoId: formData.tipoDeProductoId,
          tipoDeElementoId: formData.tipoDeElementoId || undefined,
          clienteId: formData.porDefecto ? undefined : formData.clienteId || undefined,
          sucursalId: formData.porDefecto ? undefined : formData.sucursalId || undefined
        };

        const newCheckList = await createCheckList(createData);
        setCheckList(newCheckList);
        setNotification({
          type: 'success',
          message: 'Checklist creado correctamente'
        });
      }

      // Guardar detalles si hay alguno
      if (detalles.length > 0 && checkList) {
        for (const detalle of detalles) {
          if (detalle.id === 0) {
            // Nuevo detalle
            const detalleData: CheckListDetalleCreateRequest = {
              orden: detalle.orden,
              titulo: detalle.titulo,
              item: detalle.item,
              checkListId: checkList.id,
              tipoDeDatoId: detalle.tipoDeDatoId
            };
            await createCheckListDetalle(detalleData);
          }
        }
      }

      setTimeout(() => {
        navigate('/checklists');
      }, 1500);

    } catch (error) {
      console.error('Error al guardar checklist:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar el checklist'
      });
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/checklists')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEdit ? 'Editar Checklist' : 'Nuevo Checklist'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica los datos del checklist' : 'Crea un nuevo checklist para el sistema'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información Básica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Producto *
              </label>
              <select
                name="tipoDeProductoId"
                value={formData.tipoDeProductoId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              >
                <option value={0}>Seleccionar tipo de producto</option>
                {tiposProducto.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown de Tipo de Instalación Fija - solo si se selecciona "Instalaciones fijas" */}
            {formData.tipoDeProductoId === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Instalación Fija *
                </label>
                <select
                  name="tipoDeElementoId"
                  value={formData.tipoDeElementoId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required={formData.tipoDeProductoId === 1}
                >
                  <option value={0}>Seleccionar tipo de instalación</option>
                  {tiposElemento.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Activo
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="porDefecto"
                  checked={formData.porDefecto}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Por Defecto
                </span>
              </label>
            </div>
          </div>

          {/* Campos condicionales - solo si NO es por defecto */}
          {!formData.porDefecto && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cliente *
                </label>
                <select
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required={!formData.porDefecto}
                >
                  <option value={0}>Seleccionar cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
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
                  value={formData.sucursalId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required={!formData.porDefecto}
                >
                  <option value={0}>Seleccionar sucursal</option>
                  {sucursales
                    .filter(sucursal => !formData.clienteId || sucursal.clienteId === formData.clienteId)
                    .map(sucursal => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Detalles del checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detalles del Checklist
          </h2>

          {/* Formulario para agregar detalle */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Agregar Detalle
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  name="orden"
                  value={nuevoDetalle.orden}
                  onChange={handleDetalleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={nuevoDetalle.titulo}
                  onChange={handleDetalleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  placeholder="Ej: Inspección Visual"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item
                </label>
                <input
                  type="text"
                  name="item"
                  value={nuevoDetalle.item}
                  onChange={handleDetalleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                  placeholder="Ej: Verificar estado general"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Dato
                </label>
                <select
                  name="tipoDeDatoId"
                  value={nuevoDetalle.tipoDeDatoId}
                  onChange={handleDetalleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                >
                  <option value={0}>Seleccionar tipo</option>
                  {tiposDato.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={addDetalle}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Detalle
              </button>
            </div>
          </div>

          {/* Lista de detalles */}
          {detalles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-md font-medium text-gray-900 dark:text-white">
                Detalles Agregados ({detalles.length})
              </h3>
              {detalles.map((detalle, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {detalle.orden}.
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {detalle.titulo}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {detalle.item}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {detalle.tipoDeDato?.nombre}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/checklists')}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>

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

export default CheckListFormPage;
