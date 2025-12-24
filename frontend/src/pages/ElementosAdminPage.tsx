import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CubeIcon, EyeIcon, PencilIcon, TrashIcon, BuildingOfficeIcon, MapPinIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import { elementoService, Elemento } from '../services/elementoService';
import ViewToggle from '../components/ViewToggle';

const ElementosAdminPage: React.FC = () => {
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const navigate = useNavigate();

  useEffect(() => {
    loadElementos();
  }, []);

  const loadElementos = async () => {
    try {
      setLoading(true);
      const data = await elementoService.getAll();
      setElementos(data);
    } catch (error) {
      console.error('Error al cargar elementos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    navigate('/elementos/create');
  };

  const handleEdit = (elemento: Elemento) => {
    navigate(`/elementos/edit/${elemento.id}`);
  };

  const handleDelete = async (elemento: Elemento) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la instalación fija "${elemento.codigo || elemento.interno}"?`)) {
      try {
        await elementoService.delete(elemento.id);
        await loadElementos();
      } catch (error) {
        console.error('Error al eliminar elemento:', error);
      }
    }
  };

  const handleView = (elemento: Elemento) => {
    navigate(`/elementos/${elemento.id}`);
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
      key: 'codigo',
      label: 'Código',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {value || 'Sin código'}
        </div>
      ),
    },
    {
      key: 'interno',
      label: 'Número Interno',
      sortable: true,
      render: (value: number) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value}
        </div>
      ),
    },
    {
      key: 'tipoDeElemento',
      label: 'Tipo',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin tipo'}
        </div>
      ),
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      sortable: true,
      render: (value: any) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value?.nombre || 'Sin sucursal'}
        </div>
      ),
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {value || 'Sin ubicación'}
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
                Administración de Instalaciones Fijas
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestiona todas las instalaciones fijas del sistema
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
                <CubeIcon className="w-5 h-5 mr-2" />
                Nueva Instalación
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <DataTable
            data={elementos}
            columns={columns}
            actions={actions}
            viewMode={viewMode}
            loading={loading}
            emptyMessage="No hay instalaciones fijas disponibles"
            searchPlaceholder="Buscar instalaciones..."
            onRefresh={loadElementos}
          />
        </div>
      </div>
    </div>
  );
};

export default ElementosAdminPage;
