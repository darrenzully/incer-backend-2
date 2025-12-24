import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { tareaService, Tarea, TareaCreateRequest, TareaUpdateRequest, TipoTarea, TipoProducto, Periodicidad, Sucursal, Presupuesto, getPresupuestos } from '../services/tareaService';
import { getPresupuestosAprobadosByCliente, EstadoPresupuesto } from '../services/presupuestoService';
import Notification from '../components/Notification';

const TareaFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<TareaCreateRequest>({
    nombre: '',
    descripcion: '',
    sucursalId: 0,
    presupuestoId: 0,
    clienteId: 0,
    contactoId: 0,
    tipoDeTareaId: 0,
    tipoSolicitudId: 0,
    periodicidadId: 0,
    prioridadId: 0,
    tipoDeProductoId: 0,
    tipoDeElementoId: 0,
    fecha: '',
    fechaFin: '',
    duracion: 0,
    frecuencia: 0,
    usuarioId: 0,
    estadoTareaId: 1, // Por defecto "Pendiente"
    activo: true // Por defecto activo
  });

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Estados para los datos de los dropdowns
  const [tipoTareas, setTipoTareas] = useState<TipoTarea[]>([]);
  const [tipoProductos, setTipoProductos] = useState<TipoProducto[]>([]);
  const [periodicidades, setPeriodicidades] = useState<Periodicidad[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    loadDropdownData();
    if (isEdit && id) {
      loadTarea();
    }
  }, [id, isEdit]);

  const loadDropdownData = async () => {
    try {
      // Cargar datos para los dropdowns desde el backend
      const [tiposTarea, tiposProducto, periodicidades, clientes, sucursales, presupuestos] = await Promise.all([
        tareaService.getTiposTarea(),
        tareaService.getTiposProducto(),
        tareaService.getPeriodicidades(),
        tareaService.getClientes(),
        tareaService.getSucursales(),
        getPresupuestos()
      ]);

      setTipoTareas(tiposTarea);
      setTipoProductos(tiposProducto);
      setPeriodicidades(periodicidades);
      setClientes(clientes);
      setSucursales(sucursales);
      setPresupuestos(presupuestos);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del formulario'
      });
    }
  };

  const loadTarea = async () => {
    try {
      setLoading(true);
      const tarea = await tareaService.getById(Number(id));
      
      // Convertir fecha al formato correcto para el input
      const fechaFormateada = tarea.fecha ? new Date(tarea.fecha).toISOString().split('T')[0] : '';
      
      setFormData({
        nombre: tarea.nombre || '',
        descripcion: tarea.descripcion || '',
        sucursalId: tarea.sucursalId || 0,
        presupuestoId: tarea.presupuestoId || 0,
        clienteId: tarea.sucursal?.cliente?.id || 0, // Cliente viene a través de la sucursal
        contactoId: tarea.contactoId || 0,
        tipoDeTareaId: tarea.tipoDeTareaId || 0,
        tipoSolicitudId: tarea.tipoSolicitudId || 0,
        periodicidadId: tarea.periodicidadId || 0,
        prioridadId: tarea.prioridadId || 0,
        tipoDeProductoId: tarea.tipoDeProductoId || 0,
        tipoDeElementoId: tarea.tipoDeElementoId || 0,
        fecha: fechaFormateada, // Fecha formateada correctamente
        fechaFin: tarea.fechaFin || '',
        duracion: tarea.duracion || 0,
        frecuencia: tarea.frecuencia || 0,
        usuarioId: tarea.usuarioId || 0,
        estadoTareaId: tarea.estadoTareaId || 1,
        activo: tarea.activo !== undefined ? tarea.activo : true
      });
    } catch (error) {
      console.error('Error loading tarea:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar la tarea'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));

    // Si cambia el cliente, refrescar sucursales del cliente seleccionado y resetear sucursalId
    if (name === 'clienteId') {
      const clienteId = Number(nextValue) || 0;
      if (clienteId > 0) {
        tareaService.getSucursalesByCliente(clienteId)
          .then((sucs) => {
            setSucursales(sucs || []);
          })
          .catch((err) => {
            console.error('Error al cargar sucursales por cliente:', err);
            setSucursales([]);
          });

        // Cargar presupuestos aprobados del cliente seleccionado y resetear presupuestoId
        getPresupuestosAprobadosByCliente(clienteId)
          .then((pres) => {
            setPresupuestos(pres || []);
          })
          .catch((err) => {
            console.error('Error al cargar presupuestos aprobados por cliente:', err);
            setPresupuestos([]);
          });
      } else {
        setSucursales([]);
        setPresupuestos([]);
      }
      setFormData(prev => ({ ...prev, sucursalId: 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      // Preparar datos para envío
      const submitData = {
        ...formData,
        fecha: new Date(formData.fecha).toISOString(), // Convertir a ISO string
        usuarioId: 1, // Por ahora hardcodeado, debería venir del usuario logueado
        duracion: formData.duracion || 0,
        frecuencia: formData.frecuencia || 0
      };

      if (isEdit) {
        const updateData: TareaUpdateRequest = { ...submitData, id: Number(id) };
        await tareaService.update(Number(id), updateData);
        setNotification({
          type: 'success',
          message: 'Tarea actualizada exitosamente'
        });
      } else {
        await tareaService.create(submitData);
        setNotification({
          type: 'success',
          message: 'Tarea creada exitosamente'
        });
      }
      
      setTimeout(() => {
        navigate('/tareas');
      }, 1500);
    } catch (error) {
      console.error('Error saving tarea:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la tarea'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tareas')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Volver a Tareas
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Editar Tarea' : 'Nueva Tarea'}
        </h1>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Tipo de Tarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Tarea *
            </label>
            <select
              name="tipoDeTareaId"
              value={formData.tipoDeTareaId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Seleccionar tipo de tarea</option>
              {tipoTareas.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 3. Fecha de Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 4. Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Producto *
            </label>
            <select
              name="tipoDeProductoId"
              value={formData.tipoDeProductoId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Seleccionar producto</option>
              {tipoProductos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Periodicidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Periodicidad *
            </label>
            <select
              name="periodicidadId"
              value={formData.periodicidadId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Seleccionar periodicidad</option>
              {periodicidades.map((periodicidad) => (
                <option key={periodicidad.id} value={periodicidad.id}>
                  {periodicidad.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente *
            </label>
            <select
              name="clienteId"
              value={formData.clienteId || 0}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Sucursal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sucursal *
            </label>
            <select
              name="sucursalId"
              value={formData.sucursalId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Seleccionar sucursal</option>
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* 8. Presupuesto - Solo en modo creación */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Presupuesto
              </label>
              <select
                name="presupuestoId"
                value={formData.presupuestoId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Seleccionar presupuesto (opcional)</option>
                {presupuestos.map((presupuesto) => (
                  <option key={presupuesto.id} value={presupuesto.id}>
                    {presupuesto.numero} - {presupuesto.descripcion}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 9. Activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Activo
            </label>
          </div>
        </div>

        {/* 8. Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción *
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/tareas')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckIcon className="w-4 h-4 mr-2" />
            )}
            {isEdit ? 'Actualizar' : 'Crear'} Tarea
          </button>
        </div>
      </form>
    </div>
  );
};

export default TareaFormPage;
