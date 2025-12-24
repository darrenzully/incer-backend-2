import { apiRequest, createUrlWithCenterId, getAuthHeaders } from '../utils/apiHelpers';

// Interfaces
export interface Presupuesto {
  id: number;
  numero: string;
  descripcion: string;
  fecha: string;
  usuarioId: number;
  sucursalId: number;
  estado: EstadoPresupuesto;
  estadoStr?: string;
  archivoId: number;
  activo: boolean;
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate?: string;
  
  // Navigation properties
  usuario?: User;
  sucursal?: Sucursal;
  archivos?: Archivo[];
  presupuestosRemitos?: PresupuestoRemito[];
  presupuestosArchivos?: PresupuestoArchivo[];
}

export interface Archivo {
  id: number;
  nombre?: string;
  fecha: string;
  fechaRecepcion?: string;
  contenido?: number[];
  activo: boolean;
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate?: string;
}

export interface PresupuestoRemito {
  id: number;
  remitoId: number;
  presupuestoId: number;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate?: string;
  
  remito?: Remito;
  presupuesto?: Presupuesto;
}

export interface PresupuestoArchivo {
  id: number;
  archivoId: number;
  presupuestoId: number;
  activo: boolean;
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate?: string;
  
  archivo?: Archivo;
  presupuesto?: Presupuesto;
}

export interface Remito {
  id: number;
  fecha: string;
  fechaRecepcion?: string;
  letra?: string;
  secuencia?: string;
  numero: number;
  estadoRemitoId: number;
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
  firmaOperador?: number[];
  firmaEncargado?: number[];
  activo: boolean;
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate?: string;
  
  chofer?: User;
  sucursal?: Sucursal;
  remitoManual?: Archivo;
  remitoOficial?: Archivo;
  presupuestosRemitos?: PresupuestoRemito[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  activo: boolean;
}

export interface Sucursal {
  id: number;
  nombre: string;
  clienteId: number;
  activo: boolean;
  cliente?: Cliente;
}

export interface Cliente {
  id: number;
  nombre: string;
  activo: boolean;
}

export enum EstadoPresupuesto {
  EnProceso = 1,
  Aprobado = 2,
  Reprobado = 3
}

export interface PresupuestoCreateRequest {
  numero?: string;
  descripcion: string;
  fecha?: string;
  usuarioId: number;
  sucursalId: number;
  estado?: EstadoPresupuesto;
  archivoId?: number;
}

export interface PresupuestoUpdateRequest extends PresupuestoCreateRequest {
  id: number;
}

// API Functions
export const getPresupuestos = async (): Promise<Presupuesto[]> => {
  const endpoint = createUrlWithCenterId('/api/Presupuestos');
  return await apiRequest(endpoint);
};

export const getPresupuestoById = async (id: number): Promise<Presupuesto> => {
  const endpoint = createUrlWithCenterId(`/api/Presupuestos/${id}`);
  return await apiRequest(endpoint);
};

export const createPresupuesto = async (presupuesto: PresupuestoCreateRequest): Promise<Presupuesto> => {
  const endpoint = createUrlWithCenterId('/api/Presupuestos');
  return await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(presupuesto)
  });
};

export const updatePresupuesto = async (id: number, presupuesto: PresupuestoUpdateRequest): Promise<void> => {
  const endpoint = createUrlWithCenterId(`/api/Presupuestos/${id}`);
  await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(presupuesto)
  });
};

export const deletePresupuesto = async (id: number): Promise<void> => {
  const endpoint = createUrlWithCenterId(`/api/Presupuestos/${id}`);
  await apiRequest(endpoint, {
    method: 'DELETE'
  });
};

export const getPresupuestosBySucursal = async (sucursalId: number): Promise<Presupuesto[]> => {
  return await apiRequest(`/api/Presupuestos/sucursal/${sucursalId}`);
};

export const getPresupuestosByEstado = async (estado: EstadoPresupuesto): Promise<Presupuesto[]> => {
  return await apiRequest(`/api/Presupuestos/estado/${estado}`);
};

export const generarNumeroPresupuesto = async (): Promise<{ numero: string }> => {
  return await apiRequest('/api/Presupuestos/generar-numero');
};

export const uploadFile = async (file: File): Promise<Archivo> => {
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = createUrlWithCenterId('/api/Presupuestos/upload-file');
  return await apiRequest(endpoint, {
    method: 'POST',
    body: formData
  });
};

export const downloadFile = async (archivoId: number): Promise<void> => {
  const endpoint = createUrlWithCenterId('/api/Presupuestos/download-file', { archivoId: archivoId.toString() });
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Error al descargar archivo: ${response.status}`);
  }

  // Obtener el nombre del archivo del header Content-Disposition
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'archivo';
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  // Crear blob y descargar
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Utilidades compuestas
export const getPresupuestosAprobadosByCliente = async (clienteId: number): Promise<Presupuesto[]> => {
  // 1) Obtener sucursales del cliente
  const sucursales: Sucursal[] = await apiRequest(`/api/Sucursales/cliente/${clienteId}`);
  if (!Array.isArray(sucursales) || sucursales.length === 0) return [];

  // 2) Traer presupuestos por cada sucursal y aplanar
  const presupuestosArrays = await Promise.all(
    sucursales.map((s) => getPresupuestosBySucursal(s.id))
  );
  const all = presupuestosArrays.flat();

  // 3) Filtrar por estado aprobado
  return all.filter(p => p.estado === EstadoPresupuesto.Aprobado);
};

// Helper functions
export const getEstadoPresupuestoLabel = (estado: EstadoPresupuesto): string => {
  switch (estado) {
    case EstadoPresupuesto.EnProceso:
      return 'En Proceso';
    case EstadoPresupuesto.Aprobado:
      return 'Aprobado';
    case EstadoPresupuesto.Reprobado:
      return 'Reprobado';
    default:
      return 'Desconocido';
  }
};

export const getEstadoPresupuestoColor = (estado: EstadoPresupuesto): string => {
  switch (estado) {
    case EstadoPresupuesto.EnProceso:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case EstadoPresupuesto.Aprobado:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case EstadoPresupuesto.Reprobado:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};
