import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface EstadoTarea {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface TipoTarea {
  id: number;
  nombre: string;
}

export interface TipoSolicitud {
  id: number;
  nombre: string;
}

export interface Prioridad {
  id: number;
  nombre: string;
}

export interface Periodicidad {
  id: number;
  nombre: string;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Contacto {
  id: number;
  tipoDeContacto: number;
  fecha: string;
  detalles?: string;
  estadoVisitaTecnica?: number;
  sucursalId: number;
  sucursal?: Sucursal;
  usuarioId: number;
  usuario?: User;
}

export interface Sucursal {
  id: number;
  nombre: string;
  clienteId: number;
  cliente?: {
    id: number;
    nombre: string;
  };
}

export interface Presupuesto {
  id: number;
  numero: string;
  descripcion: string;
  fecha: string;
  estado: number;
  sucursalId: number;
  sucursal?: Sucursal;
}

export interface User {
  id: number;
  nombre?: string;
  apellido?: string;
  alias: string;
  mail: string;
}

export interface Tarea {
  id: number;
  nombre: string;
  descripcion?: string;
  sucursalId: number;
  sucursal?: Sucursal;
  clienteId?: number;
  presupuestoId?: number;
  presupuesto?: Presupuesto;
  contactoId?: number;
  contacto?: Contacto;
  tipoDeTareaId: number;
  tipoDeTarea?: TipoTarea;
  tipoSolicitudId?: number;
  tipoSolicitud?: TipoSolicitud;
  periodicidadId?: number;
  periodicidad?: Periodicidad;
  prioridadId?: number;
  prioridad?: Prioridad;
  tipoDeProductoId?: number;
  tipoDeProducto?: TipoProducto;
  tipoDeElementoId?: number;
  fecha: string;
  fechaFin?: string;
  fechaRecepcion?: string;
  estadoTareaId: number;
  estadoTarea?: EstadoTarea;
  usuarioId: number;
  usuario?: User;
  duracion: number;
  frecuencia: number;
  archivoId?: number;
  remitoId?: number;
  activo: boolean;
}

export interface TareaCreateRequest {
  nombre: string;
  descripcion?: string;
  sucursalId: number;
  clienteId?: number;
  presupuestoId?: number;
  contactoId?: number;
  tipoDeTareaId: number;
  tipoSolicitudId?: number;
  periodicidadId?: number;
  prioridadId?: number;
  tipoDeProductoId?: number;
  tipoDeElementoId?: number;
  fecha: string;
  fechaFin?: string;
  fechaRecepcion?: string;
  estadoTareaId: number;
  usuarioId: number;
  duracion: number;
  frecuencia: number;
  archivoId?: number;
  remitoId?: number;
  activo: boolean;
}

export interface TareaUpdateRequest extends TareaCreateRequest {
  id: number;
}

export const tareaService = {
  async getAll(): Promise<Tarea[]> {
    const endpoint = createUrlWithCenterId('/api/Tareas');
    return apiRequest(endpoint);
  },

  async getTareasPendientes(): Promise<Tarea[]> {
    const endpoint = createUrlWithCenterId('/api/Tareas/pendientes');
    return apiRequest(endpoint);
  },

  async getSolicitudes(): Promise<Tarea[]> {
    const endpoint = createUrlWithCenterId('/api/Tareas/solicitudes');
    return apiRequest(endpoint);
  },

  async getById(id: number): Promise<Tarea> {
    const endpoint = createUrlWithCenterId(`/api/Tareas/${id}`);
    return apiRequest(endpoint);
  },

  async create(tarea: TareaCreateRequest): Promise<Tarea> {
    return apiRequest('/api/Tareas', {
      method: 'POST',
      body: JSON.stringify(tarea)
    });
  },

  async update(id: number, tarea: TareaUpdateRequest): Promise<Tarea> {
    return apiRequest(`/api/Tareas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tarea)
    });
  },

  async delete(id: number): Promise<void> {
    return apiRequest(`/api/Tareas/${id}`, {
      method: 'DELETE'
    });
  },

  async getByUsuario(usuarioId: number): Promise<Tarea[]> {
    return apiRequest(`/api/Tareas/usuario/${usuarioId}`);
  },

  async getBySucursal(sucursalId: number): Promise<Tarea[]> {
    return apiRequest(`/api/Tareas/sucursal/${sucursalId}`);
  },

  // Métodos para obtener datos de dropdowns
  async getTiposTarea(): Promise<TipoTarea[]> {
    return apiRequest('/api/Tareas/dropdowns/tipos-tarea');
  },

  async getTiposProducto(): Promise<TipoProducto[]> {
    return apiRequest('/api/Tareas/dropdowns/tipos-producto');
  },

  async getPeriodicidades(): Promise<Periodicidad[]> {
    return apiRequest('/api/Tareas/dropdowns/periodicidades');
  },

  async getClientes(): Promise<any[]> {
    return apiRequest('/api/Tareas/dropdowns/clientes');
  },

  async getSucursales(): Promise<Sucursal[]> {
    return apiRequest('/api/Tareas/dropdowns/sucursales');
  }
  ,
  async getSucursalesByCliente(clienteId: number): Promise<Sucursal[]> {
    return apiRequest(`/api/Sucursales/cliente/${clienteId}`);
  }
  ,
  async getEstadosDeTarea(): Promise<EstadoTarea[]> {
    return apiRequest('/api/EstadosDeTarea');
  }
  ,
  async getPrioridades(): Promise<Prioridad[]> {
    return apiRequest('/api/Prioridades');
  }
  ,
  async getTiposSolicitud(): Promise<TipoSolicitud[]> {
    return apiRequest('/api/TiposDeSolicitud');
  }
  ,
  async getUsers(): Promise<User[]> {
    return apiRequest('/api/Users');
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

export const getPrioridadColor = (prioridad: string): string => {
  switch (prioridad.toLowerCase()) {
    case 'baja':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'media':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'alta':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'crítica':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Método para obtener presupuestos
export const getPresupuestos = async (): Promise<Presupuesto[]> => {
  return apiRequest('/api/presupuestos');
};
