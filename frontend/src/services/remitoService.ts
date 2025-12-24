import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

// Interfaces
export interface Remito {
  id: number;
  remitoUsuarioId?: number;
  remitoUsuario?: RemitoUsuario;
  fecha: string;
  fechaRecepcion?: string;
  letra?: string;
  secuencia?: string;
  numero: number;
  estadoRemito: EstadoRemito;
  choferId: number;
  chofer?: User;
  sucursalId: number;
  sucursal?: Sucursal;
  remitoManualId?: number;
  remitoManual?: Archivo;
  remitoOficialId?: number;
  remitoOficial?: Archivo;
  fechaRemitoOficial?: string;
  numeroRemitoOficial?: number;
  fechaFactura?: string;
  numeroFactura?: number;
  presupuestoId?: number;
  presupuesto?: Presupuesto;
  noFacturable: boolean;
  descripcion?: string;
  observaciones?: string;
  firmaOperador?: string;
  firmaEncargado?: string;
  activo: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaUpdate?: string;
  usuarioUpdate?: string;
  presupuestosRemitos?: PresupuestoRemito[];
}

export interface RemitoUsuario {
  id: number;
  letra?: string;
  secuencia?: string;
  numeroDesde: number;
  numeroHasta: number;
  choferId: number;
  chofer?: User;
}

export interface User {
  id: number;
  alias: string;
  mail: string;
  nombre?: string;
  apellido?: string;
  roleId: number;
  role?: any;
  userAppAccesses: any[];
  userCenterAppAccesses: any[];
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  activo: boolean;
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate?: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  clienteId: number;
  cliente?: Cliente;
}

export interface Cliente {
  id: number;
  nombre: string;
}

export interface Archivo {
  id: number;
  nombre?: string;
  fecha: string;
  fechaRecepcion?: string;
  contenido?: string;
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

export interface PresupuestoRemito {
  id: number;
  presupuestoId: number;
  remitoId: number;
  descripcion?: string;
}

export enum EstadoRemito {
  Pendiente = 1,
  EnProceso = 2,
  Completado = 3,
  Cancelado = 4
}

export interface RemitoCreateRequest {
  remitoUsuarioId?: number;
  fecha: string;
  fechaRecepcion?: string;
  letra?: string;
  secuencia?: string;
  numero: number;
  estadoRemito: EstadoRemito;
  choferId: number;
  sucursalId: number;
  remitoManualId?: number;
  remitoOficialId?: number;
  fechaRemitoOficial?: string;
  numeroRemitoOficial?: number;
  fechaFactura?: string;
  numeroFactura?: number;
  presupuestoId?: number;
  noFacturable: boolean;
  descripcion?: string;
  observaciones?: string;
}

export interface RemitoUpdateRequest {
  id: number;
  remitoUsuarioId?: number;
  fecha: string;
  fechaRecepcion?: string;
  letra?: string;
  secuencia?: string;
  numero: number;
  estadoRemito: EstadoRemito;
  choferId: number;
  sucursalId: number;
  remitoManualId?: number;
  remitoOficialId?: number;
  fechaRemitoOficial?: string;
  numeroRemitoOficial?: number;
  fechaFactura?: string;
  numeroFactura?: number;
  presupuestoId?: number;
  noFacturable: boolean;
  descripcion?: string;
  observaciones?: string;
}

// API calls
export const getRemitos = async (): Promise<Remito[]> => {
  const endpoint = createUrlWithCenterId('/api/Remitos');
  return await apiRequest(endpoint);
};

export const getRemitoById = async (id: number): Promise<Remito> => {
  const endpoint = createUrlWithCenterId(`/api/Remitos/${id}`);
  return await apiRequest(endpoint);
};

export const createRemito = async (data: RemitoCreateRequest): Promise<Remito> => {
  const endpoint = createUrlWithCenterId('/api/Remitos');
  return await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateRemito = async (id: number, data: RemitoUpdateRequest): Promise<void> => {
  const endpoint = createUrlWithCenterId(`/api/Remitos/${id}`);
  return await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteRemito = async (id: number): Promise<void> => {
  const endpoint = createUrlWithCenterId(`/api/Remitos/${id}`);
  return await apiRequest(endpoint, {
    method: 'DELETE'
  });
};

export const generarNumeroRemito = async (choferId: number, letra?: string, secuencia?: string): Promise<{ numero: string }> => {
  const params = new URLSearchParams();
  if (letra) params.append('letra', letra);
  if (secuencia) params.append('secuencia', secuencia);
  
  const queryString = params.toString();
  const endpoint = `/api/Remitos/generar-numero/${choferId}${queryString ? `?${queryString}` : ''}`;
  
  return await apiRequest(endpoint);
};

export const getRemitosBySucursal = async (sucursalId: number): Promise<Remito[]> => {
  const endpoint = createUrlWithCenterId('/api/Remitos/sucursal', { sucursalId: sucursalId.toString() });
  return await apiRequest(endpoint);
};

export const getRemitosByEstado = async (estado: EstadoRemito): Promise<Remito[]> => {
  const endpoint = createUrlWithCenterId('/api/Remitos/estado', { estado: estado.toString() });
  return await apiRequest(endpoint);
};

export const getRemitosByChofer = async (choferId: number): Promise<Remito[]> => {
  const endpoint = createUrlWithCenterId('/api/Remitos/chofer', { choferId: choferId.toString() });
  return await apiRequest(endpoint);
};

export const getRemitosByFecha = async (fechaDesde: string, fechaHasta: string): Promise<Remito[]> => {
  const endpoint = createUrlWithCenterId('/api/Remitos/fecha', { fechaDesde, fechaHasta });
  return await apiRequest(endpoint);
};

// Helper functions
export const getEstadoRemitoLabel = (estado: EstadoRemito): string => {
  switch (estado) {
    case EstadoRemito.Pendiente:
      return 'Pendiente';
    case EstadoRemito.EnProceso:
      return 'En Proceso';
    case EstadoRemito.Completado:
      return 'Completado';
    case EstadoRemito.Cancelado:
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

export const getEstadoRemitoColor = (estado: EstadoRemito): string => {
  switch (estado) {
    case EstadoRemito.Pendiente:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case EstadoRemito.EnProceso:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case EstadoRemito.Completado:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case EstadoRemito.Cancelado:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const getFormattedRemitoNumber = (remito: Remito | null | undefined): string => {
  if (!remito) return 'N/A';
  const letra = remito.letra || '';
  const secuencia = remito.secuencia || '';
  const numero = remito.numero || 0;
  return `${letra}${secuencia}${numero.toString().padStart(4, '0')}`;
};
