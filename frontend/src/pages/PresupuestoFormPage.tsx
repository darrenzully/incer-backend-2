import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  createPresupuesto,
  updatePresupuesto,
  getPresupuestoById,
  generarNumeroPresupuesto,
  uploadFile,
  Presupuesto,
  PresupuestoCreateRequest,
  PresupuestoUpdateRequest,
  EstadoPresupuesto
} from '../services/presupuestoService';
import { sucursalService, Sucursal } from '../services/sucursalService';
import { clienteService, Cliente } from '../services/clienteService';
import Notification from '../components/Notification';

const PresupuestoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    numero: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    clienteId: 0,
    sucursalId: 0,
    estado: EstadoPresupuesto.EnProceso
  });

  useEffect(() => {
    loadRelatedData();
    if (isEdit && id) {
      loadPresupuesto(parseInt(id));
    } else {
      generateNumero();
    }
  }, [isEdit, id]);

  const loadRelatedData = async () => {
    try {
      const [sucursalesData, clientesData] = await Promise.all([
        sucursalService.getAll(),
        clienteService.getClientes()
      ]);
      setSucursales(sucursalesData);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar datos relacionados:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del formulario'
      });
    }
  };

  const generateNumero = async () => {
    try {
      const response = await generarNumeroPresupuesto();
      setFormData(prev => ({
        ...prev,
        numero: response.numero
      }));
    } catch (error) {
      console.error('Error al generar número:', error);
    }
  };

  const loadPresupuesto = async (presupuestoId: number) => {
    try {
      setLoading(true);
      const data = await getPresupuestoById(presupuestoId);
      setPresupuesto(data);
      setFormData({
        numero: data.numero,
        descripcion: data.descripcion,
        fecha: data.fecha.split('T')[0],
        clienteId: data.sucursal?.clienteId || 0,
        sucursalId: data.sucursalId,
        estado: data.estado
      });
    } catch (error) {
      console.error('Error al cargar presupuesto:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar el presupuesto'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clienteId' || name === 'sucursalId' || name === 'estado' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const getFilteredSucursales = () => {
    if (formData.clienteId === 0) {
      return sucursales;
    }
    return sucursales.filter(sucursal => sucursal.clienteId === formData.clienteId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion.trim()) {
      setNotification({
        type: 'error',
        message: 'La descripción es requerida'
      });
      return;
    }

    if (!formData.clienteId) {
      setNotification({
        type: 'error',
        message: 'El cliente es requerido'
      });
      return;
    }

    if (!formData.sucursalId) {
      setNotification({
        type: 'error',
        message: 'La sucursal es requerida'
      });
      return;
    }

    try {
      setLoading(true);

      let archivoId = 0;
      
      // Subir archivo si se seleccionó uno
      if (selectedFile) {
        const uploadedFile = await uploadFile(selectedFile);
        archivoId = uploadedFile.id;
      }

      if (isEdit && presupuesto) {
        const updateData: PresupuestoUpdateRequest = {
          id: presupuesto.id,
          numero: formData.numero,
          descripcion: formData.descripcion,
          fecha: formData.fecha,
          usuarioId: presupuesto.usuarioId,
          sucursalId: formData.sucursalId,
          estado: formData.estado,
          archivoId: archivoId || presupuesto.archivoId
        };

        await updatePresupuesto(presupuesto.id, updateData);
        setNotification({
          type: 'success',
          message: 'Presupuesto actualizado correctamente'
        });
      } else {
        const createData: PresupuestoCreateRequest = {
          numero: formData.numero,
          descripcion: formData.descripcion,
          fecha: formData.fecha,
          usuarioId: 1, // TODO: Obtener del contexto de usuario
          sucursalId: formData.sucursalId,
          estado: formData.estado,
          archivoId: archivoId
        };

        const newPresupuesto = await createPresupuesto(createData);
        setPresupuesto(newPresupuesto);
        setNotification({
          type: 'success',
          message: 'Presupuesto creado correctamente'
        });
      }

      setTimeout(() => {
        navigate('/presupuestos');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar el presupuesto'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/presupuestos');
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
              {isEdit ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica los datos del presupuesto' : 'Crea un nuevo presupuesto'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información Básica
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cliente *
              </label>
              <select
                name="clienteId"
                value={formData.clienteId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
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
                required
                disabled={formData.clienteId === 0}
              >
                <option value={0}>Seleccionar sucursal</option>
                {getFilteredSucursales().map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={EstadoPresupuesto.EnProceso}>En Proceso</option>
                <option value={EstadoPresupuesto.Aprobado}>Aprobado</option>
                <option value={EstadoPresupuesto.Reprobado}>Reprobado</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Describe el presupuesto..."
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Archivo Adjunto
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Subir archivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG hasta 10MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
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

export default PresupuestoFormPage;
