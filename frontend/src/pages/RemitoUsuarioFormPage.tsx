import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  createRemitoUsuario,
  updateRemitoUsuario,
  getRemitoUsuarioById,
  RemitoUsuario,
  RemitoUsuarioCreateRequest,
  RemitoUsuarioUpdateRequest
} from '../services/remitoUsuarioService';
import { useUsers } from '../hooks/useSecurity';
import { securityService, User } from '../services/securityService';
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

const RemitoUsuarioFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [remitoUsuario, setRemitoUsuario] = useState<RemitoUsuario | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [usuarios, setUsuarios] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    letra: '',
    secuencia: '',
    numeroDesde: 1,
    numeroHasta: 100,
    choferId: 0
  });

  useEffect(() => {
    loadRelatedData();
    if (isEdit && id) {
      loadRemitoUsuario(parseInt(id));
    }
  }, [isEdit, id]);

  const loadRelatedData = async () => {
    try {
      const usuariosData = await securityService.getUsers();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error('Error al cargar datos relacionados:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los datos del formulario'
      });
    }
  };

  const loadRemitoUsuario = async (remitoUsuarioId: number) => {
    try {
      setLoading(true);
      const data = await getRemitoUsuarioById(remitoUsuarioId);
      setRemitoUsuario(data);
      setFormData({
        letra: data.letra || '',
        secuencia: data.secuencia || '',
        numeroDesde: data.numeroDesde,
        numeroHasta: data.numeroHasta,
        choferId: data.choferId
      });
    } catch (error) {
      console.error('Error al cargar asignación de remitos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar la asignación de remitos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numeroDesde' || name === 'numeroHasta' || name === 'choferId' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.choferId) {
      setNotification({
        type: 'error',
        message: 'El chofer es requerido'
      });
      return;
    }

    if (formData.numeroDesde >= formData.numeroHasta) {
      setNotification({
        type: 'error',
        message: 'El número desde debe ser menor al número hasta'
      });
      return;
    }

    try {
      setLoading(true);

      if (isEdit && remitoUsuario) {
        const updateData: RemitoUsuarioUpdateRequest = {
          id: remitoUsuario.id,
          letra: formData.letra || undefined,
          secuencia: formData.secuencia || undefined,
          numeroDesde: formData.numeroDesde,
          numeroHasta: formData.numeroHasta,
          choferId: formData.choferId
        };

        await updateRemitoUsuario(remitoUsuario.id, updateData);
        setNotification({
          type: 'success',
          message: 'Asignación de remitos actualizada correctamente'
        });
      } else {
        const createData: RemitoUsuarioCreateRequest = {
          letra: formData.letra || undefined,
          secuencia: formData.secuencia || undefined,
          numeroDesde: formData.numeroDesde,
          numeroHasta: formData.numeroHasta,
          choferId: formData.choferId
        };

        const newRemitoUsuario = await createRemitoUsuario(createData);
        setRemitoUsuario(newRemitoUsuario);
        setNotification({
          type: 'success',
          message: 'Asignación de remitos creada correctamente'
        });
      }

      setTimeout(() => {
        navigate('/remito-usuarios');
      }, 1500);
    } catch (error) {
      console.error('Error al guardar asignación de remitos:', error);
      setNotification({
        type: 'error',
        message: 'Error al guardar la asignación de remitos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/remito-usuarios');
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
              {isEdit ? 'Editar Asignación de Remitos' : 'Nueva Asignación de Remitos'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEdit ? 'Modifica los datos de la asignación de remitos' : 'Crea una nueva asignación de rangos de números de remitos'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {usuario.alias} - {usuario.mail}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Letra
            </label>
            <input
              type="text"
              name="letra"
              value={formData.letra}
              onChange={handleInputChange}
              maxLength={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secuencia
            </label>
            <input
              type="text"
              name="secuencia"
              value={formData.secuencia}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: 001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número Desde *
            </label>
            <input
              type="number"
              name="numeroDesde"
              value={formData.numeroDesde}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número Hasta *
            </label>
            <input
              type="number"
              name="numeroHasta"
              value={formData.numeroHasta}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Información del Rango
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Total de números:</strong> {(formData.numeroHasta - formData.numeroDesde + 1).toLocaleString()}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Formato:</strong> {formData.letra || 'X'}{formData.secuencia || '000'}{formData.numeroDesde.toString().padStart(4, '0')} - {formData.letra || 'X'}{formData.secuencia || '000'}{formData.numeroHasta.toString().padStart(4, '0')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <CheckIcon className="w-4 h-4 mr-2" />
            )}
            {isEdit ? 'Actualizar' : 'Crear'} Asignación
          </button>
        </div>
      </form>
    </div>
  );
};

export default RemitoUsuarioFormPage;
