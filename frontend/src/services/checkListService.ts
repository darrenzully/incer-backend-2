import { Cliente } from './clienteService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
  'Content-Type': 'application/json',
});

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.status}`);
  }
  
  return response.json();
};

export interface CheckList {
  id: number;
  activo: boolean;
  porDefecto: boolean;
  version: number;
  tipoDeProductoId: number;
  tipoDeProducto?: TipoProducto;
  tipoDeElementoId?: number;
  tipoDeElemento?: TipoElemento;
  sucursalId?: number;
  sucursal?: Sucursal;
  clienteId?: number;
  cliente?: Cliente;
  detalles?: CheckListDetalle[];
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate: string;
}

export interface CheckListDetalle {
  id: number;
  orden: number;
  titulo?: string;
  item?: string;
  checkListId: number;
  tipoDeDatoId: number;
  tipoDeDato?: TipoDato;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface TipoElemento {
  id: number;
  nombre: string;
  activo: boolean;
  detalles?: TipoElementoDetalle[];
}

export interface TipoElementoDetalle {
  id: number;
  item: string;
  tipoDeDatoId: number;
  tipoDeElementoId: number;
  activo: boolean;
}

export interface TipoDato {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Sucursal {
  id: number;
  nombre: string;
  clienteId: number;
  activo: boolean;
}

export interface CheckListCreateRequest {
  activo: boolean;
  porDefecto: boolean;
  tipoDeProductoId: number;
  tipoDeElementoId?: number;
  clienteId?: number;
  sucursalId?: number;
}

export interface CheckListUpdateRequest extends CheckListCreateRequest {
  id: number;
}

export interface CheckListDetalleCreateRequest {
  orden: number;
  titulo?: string;
  item?: string;
  checkListId: number;
  tipoDeDatoId: number;
}

export interface CheckListDetalleUpdateRequest extends CheckListDetalleCreateRequest {
  id: number;
}

// CheckList CRUD operations
export const getCheckLists = async (): Promise<CheckList[]> => {
  return await apiRequest('/api/checklists');
};

export const getCheckListById = async (id: number): Promise<CheckList> => {
  return await apiRequest(`/api/checklists/${id}`);
};

export const getCheckListDetalles = async (id: number): Promise<CheckListDetalle[]> => {
  return await apiRequest(`/api/checklists/${id}/detalles`);
};

export const createCheckList = async (checkList: CheckListCreateRequest): Promise<CheckList> => {
  return await apiRequest('/api/checklists', {
    method: 'POST',
    body: JSON.stringify(checkList),
  });
};

export const updateCheckList = async (id: number, checkList: CheckListUpdateRequest): Promise<CheckList> => {
  return await apiRequest(`/api/checklists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(checkList),
  });
};

export const deleteCheckList = async (id: number): Promise<void> => {
  await apiRequest(`/api/checklists/${id}`, {
    method: 'DELETE',
  });
};

export const reactivateCheckList = async (id: number): Promise<void> => {
  await apiRequest(`/api/checklists/${id}/reactivar`, {
    method: 'PUT',
  });
};

// CheckListDetalle CRUD operations
export const createCheckListDetalle = async (detalle: CheckListDetalleCreateRequest): Promise<CheckListDetalle> => {
  return await apiRequest('/api/checklist-detalles', {
    method: 'POST',
    body: JSON.stringify(detalle),
  });
};

export const updateCheckListDetalle = async (id: number, detalle: CheckListDetalleUpdateRequest): Promise<CheckListDetalle> => {
  return await apiRequest(`/api/checklist-detalles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(detalle),
  });
};

export const deleteCheckListDetalle = async (id: number): Promise<void> => {
  await apiRequest(`/api/checklist-detalles/${id}`, {
    method: 'DELETE',
  });
};

// Related data operations
export const getCheckListsByTipoProducto = async (tipoProductoId: number): Promise<CheckList[]> => {
  return await apiRequest(`/api/checklists/tipo-producto/${tipoProductoId}`);
};

export const getCheckListsBySucursal = async (sucursalId: number): Promise<CheckList[]> => {
  return await apiRequest(`/api/checklists/sucursal/${sucursalId}`);
};

export const getCheckListsPorDefecto = async (): Promise<CheckList[]> => {
  return await apiRequest('/api/checklists/por-defecto');
};

// Related entities
export const getTiposProducto = async (): Promise<TipoProducto[]> => {
  return await apiRequest('/api/checklists/tipos-producto');
};

export const getTiposElemento = async (): Promise<TipoElemento[]> => {
  return await apiRequest('/api/checklists/tipos-elemento');
};

export const getSucursales = async (): Promise<Sucursal[]> => {
  return await apiRequest('/api/checklists/sucursales');
};

export const getTiposDato = async (): Promise<TipoDato[]> => {
  return await apiRequest('/api/checklists/tipos-dato');
};
