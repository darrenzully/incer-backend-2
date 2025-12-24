import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface Extintor {
  id: number;
  sucursalId?: number;
  sucursal?: {
    id: number;
    nombre: string;
  };
  clienteId?: number;
  cliente?: {
    id: number;
    nombre: string;
  };
  tipoDeCargaId: number;
  tipoDeCarga?: {
    id: number;
    nombre: string;
  };
  capacidadId: number;
  capacidad?: {
    id: number;
    valor: string;
    unidad?: string;
  };
  vencimientoCarga: string;
  vencimientoPH: string;
  interno?: number;
  orden: number;
  ubicacion?: string;
  codigo?: string;
  nroSerie?: string;
  fabricanteId?: number;
  fabricante?: {
    id: number;
    nombre: string;
  };
  nroFabricante?: string;
  año?: number;
  incorporacion: string;
  etiqueta?: string;
  iram?: string;
  reserva: boolean;
  baja: boolean;
  observacionBaja?: string;
  qrId?: number;
  fechaRecepcion?: string;
  activo: boolean;
}

export interface TipoDeCarga {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Capacidad {
  id: number;
  valor: number;
  unidad?: string;
  activo: boolean;
}

export interface Fabricante {
  id: number;
  nombre: string;
  descripcion?: string;
  pais?: string;
  activo: boolean;
}

export const extintorService = {
  // Obtener todos los extintores
  getAll: async (): Promise<Extintor[]> => {
    const endpoint = createUrlWithCenterId('/api/Extintores');
    return await apiRequest(endpoint);
  },

  // Obtener extintor por ID
  getById: async (id: number): Promise<Extintor> => {
    const endpoint = createUrlWithCenterId(`/api/Extintores/${id}`);
    return await apiRequest(endpoint);
  },

  // Obtener extintores por sucursal
  getBySucursal: async (sucursalId: number): Promise<Extintor[]> => {
    const endpoint = createUrlWithCenterId('/api/Extintores/sucursal', { sucursalId: sucursalId.toString() });
    return await apiRequest(endpoint);
  },

  // Obtener extintores por cliente
  getByCliente: async (clienteId: number): Promise<Extintor[]> => {
    const endpoint = createUrlWithCenterId('/api/Extintores/cliente', { clienteId: clienteId.toString() });
    return await apiRequest(endpoint);
  },

  // Crear extintor
  create: async (extintor: Omit<Extintor, 'id'>): Promise<Extintor> => {
    const endpoint = createUrlWithCenterId('/api/Extintores');
    return await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(extintor)
    });
  },

  // Actualizar extintor
  update: async (id: number, extintor: Partial<Extintor>): Promise<void> => {
    const endpoint = createUrlWithCenterId(`/api/Extintores/${id}`);
    await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(extintor)
    });
  },

  // Eliminar extintor (borrado lógico)
  delete: async (id: number): Promise<{ message: string }> => {
    const endpoint = createUrlWithCenterId(`/api/Extintores/${id}`);
    return await apiRequest(endpoint, {
      method: 'DELETE'
    });
  },

  // Obtener tipos de carga
  getTiposCarga: async (): Promise<TipoDeCarga[]> => {
    const endpoint = createUrlWithCenterId('/api/Extintores/tipos-carga');
    return await apiRequest(endpoint);
  },

  // Obtener capacidades
  getCapacidades: async (): Promise<Capacidad[]> => {
    const endpoint = createUrlWithCenterId('/api/Extintores/capacidades');
    return await apiRequest(endpoint);
  },

  // Obtener fabricantes
  getFabricantes: async (): Promise<Fabricante[]> => {
    const endpoint = createUrlWithCenterId('/api/Extintores/fabricantes');
    return await apiRequest(endpoint);
  }
};
