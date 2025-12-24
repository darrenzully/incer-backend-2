import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListBulletIcon, EyeIcon, PencilIcon, TrashIcon, CubeIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import { getTiposElemento, deleteTipoElemento, TipoElemento } from '../services/tipoElementoService';
import ViewToggle from '../components/ViewToggle';

const TipoElementosAdminPage: React.FC = () => {
  const [tiposElemento, setTiposElemento] = useState<TipoElemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const navigate = useNavigate();

  useEffect(() => {
    loadTiposElemento();
  }, []);

  const loadTiposElemento = async () => {
    try {
      setLoading(true);
      const data = await getTiposElemento();
      setTiposElemento(data);
    } catch (error) {
      console.error('Error al cargar tipos de elemento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/tipos-elemento/create');
  };

  const handleEdit = (tipoElemento: TipoElemento) => {
    navigate(`/tipos-elemento/edit/${tipoElemento.id}`);
  };

  const handleDelete = async (tipoElemento: TipoElemento) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el tipo de elemento "${tipoElemento.nombre}"?`)) {
      try {
        await deleteTipoElemento(tipoElemento.id);
        await loadTiposElemento();
      } catch (error) {
        console.error('Error al eliminar tipo de elemento:', error);
      }
    }
  };

  const handleView = (tipoElemento: TipoElemento) => {
    navigate(`/tipos-elemento/${tipoElemento.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const columns = [
    {
      key: 'activo',
      label: 'Estado',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'detalles',
      label: 'Campos',
      sortable: false,
      render: (value: any[]) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value && value.length > 0 ? `${value.length} campo(s)` : 'Sin campos'}
        </div>
      ),
    },
    {
      key: 'fechaCreacion',
      label: 'Fecha Creación',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: 'usuarioCreacion',
      label: 'Creado por',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || 'Sistema'}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: 'Ver',
      icon: EyeIcon,
      onClick: handleView,
      className: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
    },
    {
      label: 'Editar',
      icon: PencilIcon,
      onClick: handleEdit,
      className: 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300'
    },
    {
      label: 'Eliminar',
      icon: TrashIcon,
      onClick: handleDelete,
      className: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Administración de Tipos de Elemento
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestiona todos los tipos de elemento del sistema
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
                gridLabel="Vista de Tarjetas"
                tableLabel="Vista de Tabla"
              />
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <ListBulletIcon className="w-5 h-5 mr-2" />
                Nuevo Tipo
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <DataTable
            data={tiposElemento}
            columns={columns}
            actions={actions}
            viewMode={viewMode}
            loading={loading}
            emptyMessage="No hay tipos de elemento disponibles"
            searchPlaceholder="Buscar tipos de elemento..."
            onRefresh={loadTiposElemento}
          />
        </div>
      </div>
    </div>
  );
};

export default TipoElementosAdminPage;
