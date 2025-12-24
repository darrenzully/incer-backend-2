const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const getCurrentCenterId = () => {
  return localStorage.getItem('currentCenterId');
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status}`);
  }
  
  return response.json();
};

export interface RelevamientoDetalleResultado {
  id: number;
  relevamientoDetalleId: number;
  checkListDetalleId?: number;
  checkListDetalle?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  valor: string;
  fecha: string;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre?: string;
    apellido?: string;
    alias: string;
    mail: string;
  };
}

export interface RelevamientoDetalleFoto {
  id: number;
  relevamientoDetalleId: number;
  archivoId?: number;
  url?: string;
}

export interface RelevamientoDetalle {
  id: number;
  relevamientoId: number;
  // Compat: antes usábamos descripcion, ahora Observaciones
  descripcion?: string;
  observaciones?: string;
  // Compat: antes teníamos fecha/usuario directos en el detalle; ahora los datos están en resultados, mantenemos opcionales
  fecha?: string;
  usuarioId?: number;
  usuario?: {
    id: number;
    nombre?: string;
    apellido?: string;
    alias: string;
    mail: string;
  };
  // Nuevos campos legacy
  latitud?: number;
  longitud?: number;
  productoId: number;
  puestoId?: number;
  puesto?: {
    id: number;
    nombre?: string;
  };
  archivoId?: number;
  archivo?: any;
  checkListDetalleId?: number;
  checkListDetalle?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  // Compat: nombre legacy vs nuevo
  relevamientoDetalleResultados?: RelevamientoDetalleResultado[];
  detalleResultados?: RelevamientoDetalleResultado[];
  detalleFotos?: RelevamientoDetalleFoto[];
}

export interface Relevamiento {
  id: number;
  tipoDeProductoId: number;
  tipoDeProducto?: {
    id: number;
    nombre: string;
  };
  sucursalId: number;
  sucursal?: {
    id: number;
    nombre: string;
    clienteId: number;
    cliente?: {
      id: number;
      nombre: string;
    };
  };
  tipoDeElementoId?: number;
  tipoDeElemento?: {
    id: number;
    nombre: string;
  };
  checkListId: number;
  checkList?: {
    id: number;
    nombre: string;
  };
  tareaId: number;
  tarea?: {
    id: number;
    nombre: string;
  };
  fecha: string;
  fechaFin?: string;
  leyenda?: string;
  descripcion?: string;
  fechaRecepcion?: string;
  estadoTareaId: number;
  estadoTarea?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  usuarioId: number;
  usuario?: {
    id: number;
    alias: string;
    mail: string;
  };
  remitoId?: number;
  activo: boolean;
  relevamientoDetalles?: RelevamientoDetalle[];
}

export const relevamientoService = {
  async getAll(): Promise<Relevamiento[]> {
    const centerId = getCurrentCenterId();
    const endpoint = centerId ? `/api/relevamientos?centerId=${centerId}` : '/api/relevamientos';
    return apiRequest(endpoint);
  },

  async getAllPaginated(page: number = 1, pageSize: number = 10): Promise<{ data: Relevamiento[], total: number, page: number, pageSize: number }> {
    const centerId = getCurrentCenterId();
    const endpoint = centerId 
      ? `/api/relevamientos?page=${page}&pageSize=${pageSize}&centerId=${centerId}`
      : `/api/relevamientos?page=${page}&pageSize=${pageSize}`;
    return apiRequest(endpoint);
  },

  async search(filters: {
    cliente?: string;
    sucursal?: string;
    tipoProducto?: string;
    estadoTareaId?: number;
    usuarioId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ 
    data: Relevamiento[], 
    total: number, 
    page: number, 
    pageSize: number,
    totalPages: number
  }> {
    const params = new URLSearchParams();
    
    if (filters.cliente) params.append('cliente', filters.cliente);
    if (filters.sucursal) params.append('sucursal', filters.sucursal);
    if (filters.tipoProducto) params.append('tipoProducto', filters.tipoProducto);
    if (filters.estadoTareaId) params.append('estadoTareaId', filters.estadoTareaId.toString());
    if (filters.usuarioId) params.append('usuarioId', filters.usuarioId.toString());
    if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    // Agregar centro actual si existe
    const centerId = getCurrentCenterId();
    if (centerId) {
      params.append('centerId', centerId);
    }

    const url = `/api/relevamientos/search?${params.toString()}`;
    console.log('=== LLAMADA HTTP ===');
    console.log('URL:', url);
    console.log('Filtros enviados:', filters);
    console.log('CenterId incluido:', centerId);

    return apiRequest(url);
  },

  async getById(id: number): Promise<Relevamiento> {
    const centerId = getCurrentCenterId();
    const endpoint = centerId ? `/api/relevamientos/${id}?centerId=${centerId}` : `/api/relevamientos/${id}`;
    return apiRequest(endpoint);
  },

  async getFilterOptions(): Promise<{
    clientes: { value: string; label: string }[];
    sucursales: { value: string; label: string; cliente: string }[];
    estados: { value: number; label: string }[];
    tiposProducto: { value: string; label: string }[];
  }> {
    const centerId = getCurrentCenterId();
    const endpoint = centerId ? `/api/relevamientos/filters?centerId=${centerId}` : '/api/relevamientos/filters';
    return apiRequest(endpoint);
  },

  async getByTarea(tareaId: number): Promise<Relevamiento[]> {
    return apiRequest(`/api/relevamientos/tarea/${tareaId}`);
  },

  async getByUsuario(usuarioId: number): Promise<Relevamiento[]> {
    return apiRequest(`/api/relevamientos/usuario/${usuarioId}`);
  },

  async getBySucursal(sucursalId: number): Promise<Relevamiento[]> {
    return apiRequest(`/api/relevamientos/sucursal/${sucursalId}`);
  }
};

export const getEstadoColor = (estado: string): string => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'asignada':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'en proceso':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'finalizada':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'cancelada':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};
