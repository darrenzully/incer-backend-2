import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { relevamientoService, Relevamiento, getEstadoColor } from '../services/relevamientoService';
import { tareaService, EstadoTarea, User } from '../services/tareaService';
import { getTiposElemento, TipoElemento } from '../services/tipoElementoService';
import DataTable from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import Notification from '../components/Notification';

const RelevamientosPage: React.FC = () => {
  const [relevamientos, setRelevamientos] = useState<Relevamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadosMap, setEstadosMap] = useState<Record<number, string>>({});
  const [usuariosMap, setUsuariosMap] = useState<Record<number, string>>({});
  const [tiposElementoMap, setTiposElementoMap] = useState<Record<number, string>>({});
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    clientes: { value: string; label: string }[];
    sucursales: { value: string; label: string; cliente: string }[];
    estados: { value: number; label: string }[];
    tiposProducto: { value: string; label: string }[];
  } | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadCatalogsAndData = async () => {
      try {
        setLoading(true);
        const [estados, usuarios, tiposElemento, filterOptions] = await Promise.all([
          tareaService.getEstadosDeTarea(),
          tareaService.getUsers(),
          getTiposElemento(),
          relevamientoService.getFilterOptions()
        ]);

        console.log('Filter options cargadas:', filterOptions);

        const eMap = (estados as EstadoTarea[]).reduce<Record<number, string>>((acc, e) => { acc[e.id] = e.nombre; return acc; }, {});
        const uMap = (usuarios as User[]).reduce<Record<number, string>>((acc, u) => { acc[u.id] = u.alias; return acc; }, {});
        const teMap = (tiposElemento as TipoElemento[]).reduce<Record<number, string>>((acc, t) => { acc[t.id] = t.nombre; return acc; }, {});
        
        setEstadosMap(eMap);
        setUsuariosMap(uMap);
        setTiposElementoMap(teMap);
        setFilterOptions(filterOptions);
      } catch (err) {
        console.error('Error cargando catálogos de relevamientos:', err);
        setNotification({
          type: 'error',
          message: 'Error al cargar las opciones de filtros'
        });
      } finally {
        await loadRelevamientos();
      }
    };

    loadCatalogsAndData();
  }, []);

  const loadRelevamientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await relevamientoService.getAll();
      setRelevamientos(data);
    } catch (error) {
      console.error('Error loading relevamientos:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los relevamientos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (relevamiento: Relevamiento) => {
    navigate(`/relevamientos/${relevamiento.id}`);
  };

  const handleFilterChange = async (filters: Record<string, any>) => {
    console.log('=== FILTROS APLICADOS ===');
    console.log('Filtros recibidos:', filters);
    console.log('Filtros anteriores:', currentFilters);
    
    // Mantener el estado de los filtros
    setCurrentFilters(filters);
    
    // Manejar cambio de cliente
    if (filters.cliente !== selectedCliente) {
      console.log('Cliente cambió de', selectedCliente, 'a', filters.cliente);
      setSelectedCliente(filters.cliente || '');
    }
    
    // Si hay filtros activos, hacer búsqueda completa
    const hasActiveFilters = Object.values(filters).some(value => 
      value !== '' && value !== null && value !== undefined
    );
    
    console.log('¿Hay filtros activos?', hasActiveFilters);
    
    if (hasActiveFilters) {
      try {
        setLoading(true);
        
        // Preparar parámetros de búsqueda, solo incluyendo filtros con valores
        const searchParams: any = {
          pageSize: 100 // Traer más resultados cuando hay filtros
        };
        
        if (filters.cliente) searchParams.cliente = filters.cliente;
        if (filters.sucursal) searchParams.sucursal = filters.sucursal;
        if (filters.estadoTarea) searchParams.estadoTareaId = filters.estadoTarea;
        if (filters.tipoProducto) searchParams.tipoProducto = filters.tipoProducto;
        
        console.log('=== PARÁMETROS DE BÚSQUEDA ===');
        console.log('Parámetros enviados:', searchParams);
        
        const searchResult = await relevamientoService.search(searchParams);
        console.log('=== RESULTADO DE BÚSQUEDA ===');
        console.log('Resultados encontrados:', searchResult.data.length);
        console.log('Datos recibidos:', searchResult.data);
        
        setRelevamientos(searchResult.data);
      } catch (error) {
        console.error('=== ERROR EN BÚSQUEDA ===');
        console.error('Error completo:', error);
        setNotification({
          type: 'error',
          message: 'Error al buscar relevamientos'
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Si no hay filtros, cargar los últimos 10
      console.log('Sin filtros activos, cargando últimos 10');
      loadRelevamientos();
    }
  };

  const columns = [
    {
      key: 'estadoTarea',
      label: 'Estado',
      render: (value: any, row: Relevamiento) => {
        const nombre = row?.estadoTarea?.nombre || estadosMap[row?.estadoTareaId as number];
        const color = nombre ? getEstadoColor(nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
            {nombre || 'N/A'}
          </span>
        );
      }
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (value: any, row: Relevamiento) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.fecha ? new Date(row.fecha).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'fechaFin',
      label: 'Fecha Fin',
      render: (value: any, row: Relevamiento) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.fechaFin ? new Date(row.fechaFin).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'usuario',
      label: 'Usuario',
      render: (value: any, row: Relevamiento) => {
        const nombreCompleto = (row as any)?.usuario?.apellido && (row as any)?.usuario?.nombre
          ? `${(row as any).usuario.apellido}, ${(row as any).usuario.nombre}`
          : undefined;
        return (
          <div className="text-gray-900 dark:text-gray-100">
            {nombreCompleto || usuariosMap[row?.usuarioId as number] || 'N/A'}
          </div>
        );
      }
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (value: any, row: Relevamiento) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.sucursal?.cliente?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      render: (value: any, row: Relevamiento) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.sucursal?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'tipoRelevamiento',
      label: 'TIPO',
      render: (value: any, row: Relevamiento) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.tipoDeProducto?.nombre || 'N/A'}
        </div>
      )
    },
    {
      key: 'tipoDeElemento',
      label: 'Tipo inst. fija',
      render: (value: any, row: Relevamiento) => {
        const esInstFijas = (row?.tipoDeProducto?.nombre || '').toLowerCase().includes('instal');
        const nombre = row?.tipoDeElemento?.nombre || tiposElementoMap[row?.tipoDeElementoId as number];
        return (
          <div className="text-gray-900 dark:text-gray-100">
            {esInstFijas ? (nombre || 'N/A') : '—'}
          </div>
        );
      }
    },
    {
      key: 'fechaRecepcion',
      label: 'Fecha de recepción del servidor',
      render: (value: any, row: Relevamiento) => (
        <div className="text-gray-900 dark:text-gray-100">
          {row?.fechaRecepcion ? new Date(row.fechaRecepcion).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Ver',
      icon: EyeIcon,
      onClick: handleView,
      className: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
    }
  ];

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {relevamientos.map((relevamiento) => (
        <div key={relevamiento.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Relevamiento #{relevamiento.id}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Fecha:</span> {new Date(relevamiento.fecha).toLocaleDateString()}
                </div>
            <div>
              <span className="font-medium">Fecha Fin:</span> {relevamiento.fechaFin ? new Date(relevamiento.fechaFin).toLocaleDateString() : 'N/A'}
            </div>
                <div>
                  <span className="font-medium">Tarea:</span> {relevamiento.tarea?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Sucursal:</span> {relevamiento.sucursal?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Cliente:</span> {relevamiento.sucursal?.cliente?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Producto:</span> {relevamiento.tipoDeProducto?.nombre || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Usuario:</span>{' '}
                  {(() => {
                    const u = (relevamiento as any)?.usuario;
                    const nombreCompleto = u?.apellido && u?.nombre ? `${u.apellido}, ${u.nombre}` : undefined;
                    return nombreCompleto || usuariosMap[relevamiento.usuarioId as number] || 'N/A';
                  })()}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                relevamiento.estadoTarea ? getEstadoColor(relevamiento.estadoTarea.nombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {relevamiento.estadoTarea?.nombre || 'N/A'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleView(relevamiento)}
              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              title="Ver"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-gray-600 dark:text-gray-400">Cargando relevamientos...</p>
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">Error: {error}</p>
        )}
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Relevamientos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualiza los relevamientos del sistema
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle
            currentView={viewMode}
            onViewChange={setViewMode}
          />
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={relevamientos}
          columns={columns}
          actions={actions}
          searchPlaceholder="Buscar por ID, tarea, sucursal, cliente o producto..."
          filters={[
            {
              key: 'cliente',
              label: 'Cliente',
              type: 'select',
              options: filterOptions?.clientes || []
            },
            {
              key: 'sucursal',
              label: 'Sucursal',
              type: 'select',
              options: filterOptions?.sucursales 
                ? (selectedCliente 
                    ? filterOptions.sucursales
                        .filter(s => s.cliente === selectedCliente)
                        .map(s => ({ value: s.value, label: s.label }))
                    : filterOptions.sucursales.map(s => ({ value: s.value, label: s.label })))
                : []
            },
            {
              key: 'estadoTarea',
              label: 'Estado',
              type: 'select',
              options: filterOptions?.estados || Object.entries(estadosMap).map(([id, nombre]) => ({
                value: parseInt(id),
                label: nombre
              }))
            },
            {
              key: 'tipoProducto',
              label: 'Tipo Producto',
              type: 'select',
              options: filterOptions?.tiposProducto || []
            }
          ]}
          enableAdvancedFilters={true}
          onFilterChange={handleFilterChange}
          initialFilters={currentFilters}
        />
      ) : (
        renderGridView()
      )}
    </div>
  );
};

export default RelevamientosPage;
