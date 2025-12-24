import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronUpIcon, 
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (row: any) => void;
  className?: string;
  hidden?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'boolean';
  options?: { value: any; label: string }[];
  placeholder?: string;
  nestedKey?: string; // Para campos anidados, ej: 'sucursal.cliente.nombre'
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  title?: string;
  onAdd?: () => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  customActions?: (row: any) => React.ReactNode;
  viewMode?: 'grid' | 'table';
  loading?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
  filters?: FilterConfig[];
  enableAdvancedFilters?: boolean;
  onFilterChange?: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  actions,
  title,
  onAdd,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = "Buscar...",
  itemsPerPage = 10,
  customActions,
  viewMode = 'table',
  loading = false,
  emptyMessage = "No hay datos disponibles",
  onRefresh,
  filters = [],
  enableAdvancedFilters = true,
  onFilterChange,
  initialFilters = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>(initialFilters);

  // Actualizar filtros cuando cambien las opciones pero mantener valores existentes
  // Solo actualizar si los initialFilters realmente cambiaron (no en cada render)
  React.useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setAdvancedFilters(prev => {
        // Solo actualizar si hay diferencias reales
        const hasChanges = Object.keys(initialFilters).some(key => 
          prev[key] !== initialFilters[key]
        );
        if (hasChanges) {
          return {
            ...prev,
            ...initialFilters
          };
        }
        return prev;
      });
    }
  }, [initialFilters]);

  // Función para buscar en propiedades anidadas
  const searchInNestedProperties = (obj: any, searchTerm: string): boolean => {
    const term = searchTerm.toLowerCase();
    
    // Campos comunes para todas las entidades
    const commonFields = [
      obj.id?.toString(),
      obj.nombre,
      obj.numero?.toString(),
      obj.telefono,
      obj.email,
      obj.alias,
      obj.descripcion,
      // Campos anidados comunes
      obj.cliente?.nombre,
      obj.vendedor?.alias,
      obj.vendedor?.nombre,
      obj.tipoDeCliente?.nombre,
      obj.tipoDeServicio?.nombre,
    ];
    
    // Campos específicos para relevamientos
    const relevamientoFields = [
      obj.fecha?.toString(),
      obj.fechaFin?.toString(),
      obj.fechaRecepcion?.toString(),
      obj.sucursal?.nombre,
      obj.sucursal?.cliente?.nombre,
      obj.usuario?.nombre,
      obj.usuario?.apellido,
      obj.estadoTarea?.nombre,
      obj.tipoDeProducto?.nombre,
      obj.tipoDeElemento?.nombre,
      obj.tarea?.nombre
    ];
    
    // Campos específicos para remitos (número formateado)
    const remitoFields = [
      obj.letra,
      obj.secuencia,
      obj.numero?.toString(),
      // Número formateado: letra + secuencia + numero con padding
      obj.letra && obj.secuencia && obj.numero 
        ? `${obj.letra}${obj.secuencia}${obj.numero.toString().padStart(4, '0')}`
        : null,
      // También buscar sin padding
      obj.letra && obj.secuencia && obj.numero 
        ? `${obj.letra}${obj.secuencia}${obj.numero}`
        : null
    ];
    
    // Campos específicos para tareas
    const tareaFields = [
      obj.tipoDeTarea?.nombre,
      obj.estadoTarea?.nombre,
      obj.prioridad?.nombre,
      obj.usuario?.alias,
      obj.usuario?.nombre,
      obj.sucursal?.nombre,
      obj.sucursal?.cliente?.nombre,
      obj.tipoDeProducto?.nombre
    ];
    
    // Campos específicos para solicitudes (enfocado en estado)
    const solicitudFields = [
      obj.estadoTarea?.nombre, // Prioridad al estado para solicitudes
      obj.tipoSolicitud?.nombre,
      obj.prioridad?.nombre,
      obj.usuario?.alias,
      obj.usuario?.nombre,
      obj.sucursal?.nombre,
      obj.sucursal?.cliente?.nombre,
      obj.nombre
    ];
    
    // Campos específicos para órdenes de trabajo (número formateado)
    const ordenTrabajoFields = [
      obj.numero?.toString(),
      // Número formateado: OT-{numero} con padding
      obj.numero 
        ? `OT-${obj.numero.toString().padStart(6, '0')}`
        : null,
      // También buscar sin padding
      obj.numero 
        ? `OT-${obj.numero}`
        : null,
      // Buscar solo el número sin el prefijo
      obj.numero?.toString()
    ];
    
    // Campos específicos para extintores (prioridad a sucursal)
    const extintorFields = [
      obj.sucursal?.nombre, // Prioridad a sucursal para extintores
      obj.cliente?.nombre,
      obj.interno?.toString(),
      obj.nroSerie,
      obj.tipoDeCarga?.nombre,
      obj.iram,
      obj.codigo,
      obj.ubicacion
    ];
    
    // Campos específicos para puestos (prioridad a nombre)
    const puestoFields = [
      obj.nombre, // Prioridad a nombre para puestos
      obj.sucursal?.nombre,
      obj.sucursal?.cliente?.nombre,
      obj.ubicacion,
      obj.codigo,
      obj.extintor?.codigo,
      obj.extintor?.nroSerie
    ];
    
    // Campos específicos para elementos/instalaciones fijas (prioridad a tipo de elemento)
    const elementoFields = [
      obj.tipoDeElemento?.nombre, // Prioridad a tipo de elemento
      obj.sucursal?.nombre,
      obj.sucursal?.cliente?.nombre,
      obj.ubicacion,
      obj.interno?.toString(),
      obj.id?.toString()
    ];
    
    // Campos específicos para centers (prioridad a name)
    const centerFields = [
      obj.name, // Prioridad a name para centers
      obj.description
    ];
    
    // Campos específicos para QRs (prioridad a sucursal)
    const qrFields = [
      obj.sucursal, // Prioridad a sucursal para QRs
      obj.cliente,
      obj.tipoProducto,
      obj.tipoElemento,
      obj.producto,
      obj.codigo
    ];
    
    // Combinar todos los campos
    const searchFields = [...commonFields, ...relevamientoFields, ...remitoFields, ...tareaFields, ...solicitudFields, ...ordenTrabajoFields, ...extintorFields, ...puestoFields, ...elementoFields, ...centerFields, ...qrFields];
    
    const found = searchFields.some(field => 
      field && field.toLowerCase().includes(term)
    );
    
    // Debug: mostrar qué campos se están buscando
    if (searchTerm && searchTerm.length > 0) {
      console.log('Buscando:', term, 'en campos:', searchFields.filter(f => f), 'Resultado:', found);
    }
    
    return found;
  };

  // Función helper para obtener valores de campos anidados
  const getNestedValue = (obj: any, path: string): any => {
    if (!path) return obj;
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  };

  // Generar opciones para filtros de tipo select/multiselect
  const generateFilterOptions = (filter: FilterConfig) => {
    const uniqueValues = Array.from(
      new Set(
        data
          .map(item => {
            const value = filter.nestedKey ? getNestedValue(item, filter.nestedKey) : item[filter.key];
            return value;
          })
          .filter(Boolean)
      )
    );
    
    return uniqueValues.map(value => {
      // Si el valor es un objeto con propiedades comunes, usar nombre o label
      if (typeof value === 'object' && value !== null) {
        const label = value.nombre || value.label || value.name || String(value);
        return { value: value.id || value, label };
      }
      return { value, label: String(value) };
    });
  };

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    console.log('=== FILTRADO EN DATATABLE ===');
    console.log('Datos recibidos:', data.length);
    console.log('Término de búsqueda:', searchTerm);
    console.log('Filtros avanzados:', advancedFilters);
    
    let filtered = data.filter(item => {
      // Filtro de búsqueda general mejorado
      const matchesSearch = searchTerm === '' || searchInNestedProperties(item, searchTerm);

      // Filtros avanzados - SOLO aplicar si NO hay callback externo
      const matchesAdvancedFilters = onFilterChange ? true : filters.every(filter => {
        // Manejar rangos de fechas primero (tienen lógica especial)
        if (filter.type === 'daterange') {
          const fechaDesde = advancedFilters[`${filter.key}_desde`];
          const fechaHasta = advancedFilters[`${filter.key}_hasta`];
          
          // Si no hay fechas seleccionadas, no filtrar
          if (!fechaDesde && !fechaHasta) return true;
          
          // Obtener el valor del item (soporta campos anidados)
          const itemValue = filter.nestedKey ? getNestedValue(item, filter.nestedKey) : item[filter.key];
          
          // Si no hay fecha en el item, excluirlo
          if (!itemValue) return false;
          
          // Convertir a Date y normalizar (solo fecha, sin hora)
          const itemDate = new Date(itemValue);
          itemDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
          
          // Verificar que la fecha sea válida
          if (isNaN(itemDate.getTime())) {
            console.warn('Fecha inválida en item:', itemValue, 'para filtro:', filter.key);
            return false;
          }
          
          // Comparar con fecha desde
          if (fechaDesde) {
            const desdeDate = new Date(fechaDesde);
            desdeDate.setHours(0, 0, 0, 0); // Inicio del día
            if (itemDate < desdeDate) {
              return false;
            }
          }
          
          // Comparar con fecha hasta
          if (fechaHasta) {
            const hastaDate = new Date(fechaHasta);
            hastaDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
            if (itemDate > hastaDate) {
              return false;
            }
          }
          
          return true;
        }
        
        // Para otros tipos de filtros, verificar si hay valor
        const filterValue = advancedFilters[filter.key];
        if (!filterValue || filterValue === '' || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true;
        }
        
        // Obtener el valor del item (soporta campos anidados)
        const itemValue = filter.nestedKey ? getNestedValue(item, filter.nestedKey) : item[filter.key];
        
        // Manejar arrays (multiselect)
        if (Array.isArray(filterValue)) {
          // Para campos anidados, comparar con el ID o valor completo
          if (filter.nestedKey && typeof itemValue === 'object') {
            return filterValue.some(fv => fv === itemValue?.id || fv === itemValue);
          }
          return filterValue.includes(itemValue);
        }
        
        // Manejar booleanos
        if (typeof filterValue === 'boolean') {
          return itemValue === filterValue;
        }
        
        // Manejar campos anidados para select
        if (filter.nestedKey && typeof itemValue === 'object') {
          const compareValue = itemValue?.id || itemValue?.nombre || itemValue?.label || itemValue;
          return String(compareValue) === String(filterValue) || 
                 String(compareValue).toLowerCase().includes(String(filterValue).toLowerCase());
        }
        
        // Comparación de texto estándar
        return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
      });

      const result = matchesSearch && matchesAdvancedFilters;
      if (!result) {
        console.log('Item filtrado:', item.id, 'matchesSearch:', matchesSearch, 'matchesAdvancedFilters:', matchesAdvancedFilters);
      }
      return result;
    });
    
    console.log('Datos después del filtrado:', filtered.length);

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
    }, [data, searchTerm, sortColumn, sortDirection, advancedFilters, onFilterChange, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    const newFilters = {
      ...advancedFilters,
      [filterKey]: value
    };
    
    setAdvancedFilters(newFilters);
    setCurrentPage(1);
    
    // Si hay callback externo, llamarlo con un pequeño delay para evitar cierre inmediato
    if (onFilterChange) {
      setTimeout(() => {
        onFilterChange(newFilters);
      }, 100);
    }
  };

  const clearFilters = () => {
    setAdvancedFilters({});
    setSearchTerm('');
    setCurrentPage(1);
    
    // Si hay callback externo, llamarlo con filtros vacíos
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const hasActiveFilters = filters.some(filter => {
    if (filter.type === 'daterange') {
      const fechaDesde = advancedFilters[`${filter.key}_desde`];
      const fechaHasta = advancedFilters[`${filter.key}_hasta`];
      return (fechaDesde && fechaDesde !== '') || (fechaHasta && fechaHasta !== '');
    }
    const value = advancedFilters[filter.key];
    return value !== '' && value !== null && value !== undefined && 
           (!Array.isArray(value) || value.length > 0);
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Renderizar vista de cuadrícula
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {paginatedData.map((row, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="space-y-3">
            {/* Contenido de la tarjeta */}
            {columns.map((column) => (
              <div key={column.key} className="space-y-1">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {column.label}
                </div>
                <div className="text-xs text-gray-900 dark:text-gray-100">
                  {column.render ? column.render(row[column.key], row) : row[column.key] || 'N/A'}
                </div>
              </div>
            ))}
            
            {/* Acciones */}
            {actions && actions.length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-end space-x-1">
                  {actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={() => action.onClick(row)}
                      className={`p-1.5 rounded-md transition-colors duration-200 ${action.className || 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                      title={action.label}
                    >
                      <action.icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Renderizar vista de tabla
  const renderTableView = () => (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:!bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:!bg-gray-800 hover:bg-gray-50 dark:hover:!bg-gray-700 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-gray-100">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && actions.length > 0 && (
                  <td className="px-4 py-2 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      {actions
                        .filter(action => !action.hidden)
                        .map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`p-1.5 rounded-md transition-colors duration-200 ${action.className || 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title={action.label}
                          >
                            <action.icon className="w-3.5 h-3.5" />
                          </button>
                        ))}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Solo mostrar estado vacío si no hay datos originales y no hay filtros activos
  if (data.length === 0 && !hasActiveFilters && searchTerm === '') {
    return (
      <div className="space-y-6">
        {/* Header con botón Agregar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          </div>
          <div className="flex items-center space-x-4">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Intentar de nuevo
              </button>
            )}
            {onAdd && (
              <button
                onClick={onAdd}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            )}
          </div>
        </div>

        {/* Estado vacío */}
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400 text-base mb-3">{emptyMessage}</div>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            {onAdd ? 'Haz clic en "Agregar" para crear el primer registro' : 'No hay datos disponibles para mostrar'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} resultados
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              title="Actualizar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          {onAdd && (
            <button
              onClick={onAdd}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              autoComplete="off"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm border rounded-md transition-colors duration-200 relative ${
              showFilters 
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' 
                : hasActiveFilters
                  ? 'border-primary-400 bg-primary-50 text-primary-600 dark:bg-primary-900/10 dark:text-primary-400'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300 dark:hover:text-gray-200'
            }`}
          >
            <FunnelIcon className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {Object.entries(advancedFilters).filter(([_, value]) => 
                  value !== '' && value !== null && value !== undefined
                ).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && enableAdvancedFilters && filters.length > 0 && (
        onFilterChange ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-900 dark:text-white">
                Filtros Avanzados
              </h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {Object.entries(advancedFilters).filter(([_, value]) => 
                      value !== '' && value !== null && value !== undefined
                    ).length} filtro(s) activo(s)
                  </div>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filters.map((filter) => {
                const filterValue = advancedFilters[filter.key] || '';
                const options = filter.options || generateFilterOptions(filter);
                
                return (
                  <div key={filter.key}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'text' && (
                      <input
                        type="text"
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder || `Filtrar por ${filter.label.toLowerCase()}`}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                    
                    {filter.type === 'select' && (
                      <select
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Todos</option>
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {filter.type === 'multiselect' && (
                      <select
                        multiple
                        value={Array.isArray(filterValue) ? filterValue : []}
                        onChange={(e) => {
                          const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                          handleFilterChange(filter.key, selectedValues);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {filter.type === 'boolean' && (
                      <select
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value === 'true')}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Todos</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    )}
                    
                    {filter.type === 'date' && (
                      <input
                        type="date"
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                    
                    {filter.type === 'daterange' && (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={advancedFilters[`${filter.key}_desde`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_desde`, e.target.value)}
                          placeholder="Desde"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="date"
                          value={advancedFilters[`${filter.key}_hasta`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_hasta`, e.target.value)}
                          placeholder="Hasta"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                );
            })}
          </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-900 dark:text-white">
                Filtros Avanzados
              </h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {Object.entries(advancedFilters).filter(([_, value]) => 
                      value !== '' && value !== null && value !== undefined
                    ).length} filtro(s) activo(s)
                  </div>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filters.map((filter) => {
                const filterValue = advancedFilters[filter.key] || '';
                const options = filter.options || generateFilterOptions(filter);
                
                return (
                  <div key={filter.key}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'text' && (
                      <input
                        type="text"
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder || `Filtrar por ${filter.label.toLowerCase()}`}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                    
                    {filter.type === 'select' && (
                      <select
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Todos</option>
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {filter.type === 'multiselect' && (
                      <select
                        multiple
                        value={Array.isArray(filterValue) ? filterValue : []}
                        onChange={(e) => {
                          const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                          handleFilterChange(filter.key, selectedValues);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {filter.type === 'boolean' && (
                      <select
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value === 'true')}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Todos</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    )}
                    
                    {filter.type === 'date' && (
                      <input
                        type="date"
                        value={filterValue}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                    
                    {filter.type === 'daterange' && (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={advancedFilters[`${filter.key}_desde`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_desde`, e.target.value)}
                          placeholder="Desde"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="date"
                          value={advancedFilters[`${filter.key}_hasta`] || ''}
                          onChange={(e) => handleFilterChange(`${filter.key}_hasta`, e.target.value)}
                          placeholder="Hasta"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )
      )}

      {/* Content based on view mode */}
      {filteredAndSortedData.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-gray-500 dark:text-gray-400 text-base mb-3">
            {hasActiveFilters || searchTerm ? 'No se encontraron resultados con los filtros aplicados' : 'No hay datos disponibles'}
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-3">
            {hasActiveFilters || searchTerm 
              ? 'Intenta ajustar los filtros o limpiar la búsqueda' 
              : 'No hay datos disponibles para mostrar'
            }
          </p>
          {(hasActiveFilters || searchTerm) && (
            <button
              onClick={clearFilters}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderTableView()
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-transparent px-3 py-2 flex items-center justify-between sm:px-4 pagination-container">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)}
                </span>{' '}
                de <span className="font-medium">{filteredAndSortedData.length}</span> resultados
              </p>
            </div>
            <div className="bg-transparent">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                
                {/* Botón para ir a páginas anteriores */}
                {currentPage > 10 && (
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 10))}
                    className="relative inline-flex items-center px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ...
                  </button>
                )}
                
                {/* Páginas visibles (máximo 10) */}
                {(() => {
                  const maxVisiblePages = 10;
                  const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxVisiblePages / 2), totalPages - maxVisiblePages + 1));
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-2 py-1.5 border text-xs font-medium ${
                        page === currentPage
                          ? 'z-10 bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
                
                {/* Botón para ir a páginas siguientes */}
                {currentPage < totalPages - 10 && (
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 10))}
                    className="relative inline-flex items-center px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ...
                  </button>
                )}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable; 