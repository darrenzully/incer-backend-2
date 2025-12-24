import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

// Interfaces
export interface RemitoUsuario {
  id: number;
  letra?: string;
  secuencia?: string;
  numeroDesde: number;
  numeroHasta: number;
  choferId: number;
  chofer?: User;
  activo: boolean;
  fechaCreacion: string;
  usuarioCreacion: string;
  fechaUpdate?: string;
  usuarioUpdate?: string;
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

export interface RemitoUsuarioCreateRequest {
  letra?: string;
  secuencia?: string;
  numeroDesde: number;
  numeroHasta: number;
  choferId: number;
}

export interface RemitoUsuarioUpdateRequest {
  id: number;
  letra?: string;
  secuencia?: string;
  numeroDesde: number;
  numeroHasta: number;
  choferId: number;
}

// API calls
export const getRemitoUsuarios = async (): Promise<RemitoUsuario[]> => {
  try {
    console.log('=== GET REMITOS USUARIOS FRONTEND ===');
    const endpoint = createUrlWithCenterId('/api/RemitosUsuarios');
    console.log('Endpoint generado:', endpoint);
    console.log('CenterId desde localStorage:', localStorage.getItem('currentCenterId'));
    const result = await apiRequest(endpoint);
    console.log('Resultado recibido:', result);
    console.log('Cantidad de remitos usuarios:', result?.length || 0);
    console.log('=====================================');
    return result;
  } catch (error) {
    console.error('Error en getRemitoUsuarios:', error);
    throw error;
  }
};

export const getRemitoUsuarioById = async (id: number): Promise<RemitoUsuario> => {
  const endpoint = createUrlWithCenterId(`/api/RemitosUsuarios/${id}`);
  return await apiRequest(endpoint);
};

export const createRemitoUsuario = async (data: RemitoUsuarioCreateRequest): Promise<RemitoUsuario> => {
  const endpoint = createUrlWithCenterId('/api/RemitosUsuarios');
  return await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateRemitoUsuario = async (id: number, data: RemitoUsuarioUpdateRequest): Promise<void> => {
  const endpoint = createUrlWithCenterId(`/api/RemitosUsuarios/${id}`);
  return await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteRemitoUsuario = async (id: number): Promise<void> => {
  const endpoint = createUrlWithCenterId(`/api/RemitosUsuarios/${id}`);
  return await apiRequest(endpoint, {
    method: 'DELETE'
  });
};

export const getRemitoUsuariosByChofer = async (choferId: number): Promise<RemitoUsuario[]> => {
  // Nota: En la API legacy no existe /chofer/{id}; si necesitas esto, implementar en backend
  // o usar /api/RemitosUsuarios/asignados (para el usuario autenticado).
  const endpoint = createUrlWithCenterId('/api/RemitosUsuarios/chofer', { choferId: choferId.toString() });
  return await apiRequest(endpoint);
};

export const getRemitoUsuariosAsignados = async (): Promise<RemitoUsuario[]> => {
  const endpoint = createUrlWithCenterId('/api/RemitosUsuarios/asignados');
  return await apiRequest(endpoint);
};

// Helper functions
export const getFormattedNumeroRange = (remitoUsuario: RemitoUsuario | null | undefined): string => {
  if (!remitoUsuario) return 'N/A';
  const letra = remitoUsuario.letra || '';
  const secuencia = remitoUsuario.secuencia || '';
  return `${letra}${secuencia}${remitoUsuario.numeroDesde.toString().padStart(4, '0')} - ${letra}${secuencia}${remitoUsuario.numeroHasta.toString().padStart(4, '0')}`;
};

export const getTotalNumeros = (remitoUsuario: RemitoUsuario | null | undefined): number => {
  if (!remitoUsuario) return 0;
  return remitoUsuario.numeroHasta - remitoUsuario.numeroDesde + 1;
};
