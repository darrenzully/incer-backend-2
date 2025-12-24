import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

// Interfaces existentes (reutilizando las que ya están definidas en otros servicios)
export interface Sucursal {
  id: number;
  nombre: string;
  clienteId: number;
  cliente?: {
    id: number;
    nombre: string;
  };
}

export interface Usuario {
  id: number;
  alias: string;
  mail: string;
  nombre?: string;
  apellido?: string;
}

export interface Prioridad {
  id: number;
  nombre: string;
}

export interface EstadoDeOT {
  id: number;
  nombre: string;
}

export interface Remito {
  id: number;
  numero: number;
  letra?: string;
  secuencia?: string;
}

export interface OrdenDeTrabajoDetalle {
  id: number;
  ordenDeTrabajoId: number;
  descripcion: string;
  cantidad: number;
  precio: number;
  total: number;
}

// Interface principal de OrdenDeTrabajo
export interface OrdenDeTrabajo {
  id: number;
  sucursalId: number;
  sucursal?: Sucursal;
  numero: number;
  usuarioId: number;
  usuario?: Usuario;
  prioridadId: number;
  prioridad?: Prioridad;
  estadoDeOTId: number;
  estadoDeOT?: EstadoDeOT;
  fechaIngreso: string;
  fechaRecepcion?: string;
  fechaTerminacion?: string;
  fechaSalida?: string;
  fechaEntrega?: string;
  remitoId?: number;
  remito?: Remito;
  observaciones?: string;
  detalles?: OrdenDeTrabajoDetalle[];
}

export interface OrdenDeTrabajoCreateRequest {
  sucursalId: number;
  numero: number;
  usuarioId: number;
  prioridadId: number;
  estadoDeOTId: number;
  fechaIngreso: string;
  fechaRecepcion?: string;
  fechaTerminacion?: string;
  fechaSalida?: string;
  fechaEntrega?: string;
  remitoId?: number;
  observaciones?: string;
}

export interface OrdenDeTrabajoUpdateRequest extends OrdenDeTrabajoCreateRequest {
  id: number;
}

// API calls
export const ordenTrabajoService = {
  async getAll(): Promise<OrdenDeTrabajo[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo');
    return apiRequest(endpoint);
  },

  async getById(id: number): Promise<OrdenDeTrabajo> {
    const endpoint = createUrlWithCenterId(`/api/OrdenesTrabajo/${id}`);
    return apiRequest(endpoint);
  },

  async create(orden: OrdenDeTrabajoCreateRequest): Promise<OrdenDeTrabajo> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo');
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(orden)
    });
  },

  async update(id: number, orden: OrdenDeTrabajoUpdateRequest): Promise<OrdenDeTrabajo> {
    const endpoint = createUrlWithCenterId(`/api/OrdenesTrabajo/${id}`);
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(orden)
    });
  },

  async delete(id: number): Promise<void> {
    const endpoint = createUrlWithCenterId(`/api/OrdenesTrabajo/${id}`);
    return apiRequest(endpoint, {
      method: 'DELETE'
    });
  },

  async getBySucursal(sucursalId: number): Promise<OrdenDeTrabajo[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/sucursal', { sucursalId: sucursalId.toString() });
    return apiRequest(endpoint);
  },

  async getByUsuario(usuarioId: number): Promise<OrdenDeTrabajo[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/usuario', { usuarioId: usuarioId.toString() });
    return apiRequest(endpoint);
  },

  async getByEstado(estadoId: number): Promise<OrdenDeTrabajo[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/estado', { estadoId: estadoId.toString() });
    return apiRequest(endpoint);
  },

  async getByFecha(fechaDesde: string, fechaHasta: string): Promise<OrdenDeTrabajo[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/fecha', { fechaDesde, fechaHasta });
    return apiRequest(endpoint);
  },

  // Métodos para obtener datos de dropdowns
  async getSucursales(): Promise<Sucursal[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/dropdowns/sucursales');
    return apiRequest(endpoint);
  },

  async getUsuarios(): Promise<Usuario[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/dropdowns/usuarios');
    return apiRequest(endpoint);
  },

  async getPrioridades(): Promise<Prioridad[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/dropdowns/prioridades');
    return apiRequest(endpoint);
  },

  async getEstadosDeOT(): Promise<EstadoDeOT[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/dropdowns/estados');
    return apiRequest(endpoint);
  },

  async getRemitos(): Promise<Remito[]> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/dropdowns/remitos');
    return apiRequest(endpoint);
  },

  async generarNumero(): Promise<{ numero: number }> {
    const endpoint = createUrlWithCenterId('/api/OrdenesTrabajo/generar-numero');
    return apiRequest(endpoint);
  }
};

// Helper functions para colores y etiquetas
export const getEstadoOTColor = (estado: string): string => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'proceso':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'finalizada':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'entregada':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getPrioridadColor = (prioridad: string): string => {
  switch (prioridad.toLowerCase()) {
    case 'baja':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'media':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'alta':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'urgente':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const formatFecha = (fecha: string | undefined): string => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES');
};

export const getFormattedOrdenNumber = (orden: OrdenDeTrabajo | null | undefined): string => {
  if (!orden) return 'N/A';
  return `OT-${orden.numero.toString().padStart(6, '0')}`;
};
