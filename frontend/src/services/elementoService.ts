import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface Elemento {
  id: number;
  tipoDeElementoId: number;
  tipoDeElemento?: {
    id: number;
    nombre: string;
  };
  sucursalId: number;
  sucursal?: {
    id: number;
    nombre: string;
  };
  ubicacion?: string;
  codigo?: string;
  interno: number;
  activo: boolean;
  detalles?: ElementoTipoElementoDetalle[];
  ultimoRelevamiento?: string;
}

export interface ElementoTipoElementoDetalle {
  id: number;
  elementoId: number;
  tipoElementoDetalleId: number;
  tipoElementoDetalle?: {
    id: number;
    nombre: string;
    item: string;
  };
  valor: string;
}

export const elementoService = {
  // Obtener todos los elementos
  getAll: async (): Promise<Elemento[]> => {
    const endpoint = createUrlWithCenterId('/api/Elementos');
    return await apiRequest(endpoint);
  },

  // Obtener elemento por ID
  getById: async (id: number): Promise<Elemento> => {
    const endpoint = createUrlWithCenterId(`/api/Elementos/${id}`);
    return await apiRequest(endpoint);
  },

  // Obtener elementos por sucursal
  getBySucursal: async (sucursalId: number): Promise<Elemento[]> => {
    const endpoint = createUrlWithCenterId('/api/Elementos/sucursal', { sucursalId: sucursalId.toString() });
    return await apiRequest(endpoint);
  },

  // Obtener elementos por tipo de elemento
  getByTipoElemento: async (tipoElementoId: number): Promise<Elemento[]> => {
    const endpoint = createUrlWithCenterId('/api/Elementos/tipo-elemento', { tipoElementoId: tipoElementoId.toString() });
    return await apiRequest(endpoint);
  },

  // Crear elemento
  create: async (elemento: Omit<Elemento, 'id'>): Promise<Elemento> => {
    const endpoint = createUrlWithCenterId('/api/Elementos');
    return await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(elemento)
    });
  },

  // Actualizar elemento
  update: async (id: number, elemento: Partial<Elemento>): Promise<void> => {
    const endpoint = createUrlWithCenterId(`/api/Elementos/${id}`);
    await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(elemento)
    });
  },

  // Eliminar elemento (borrado lógico)
  delete: async (id: number): Promise<{ message: string }> => {
    const endpoint = createUrlWithCenterId(`/api/Elementos/${id}`);
    return await apiRequest(endpoint, {
      method: 'DELETE'
    });
  }
};
