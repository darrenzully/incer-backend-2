import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface Puesto {
  id: number;
  sucursalId: number;
  sucursal?: {
    id: number;
    nombre: string;
  };
  extintorId?: number;
  extintor?: {
    id: number;
    codigo?: string;
    nroSerie?: string;
    tipoDeCarga?: {
      id: number;
      nombre: string;
    };
    capacidad?: {
      id: number;
      valor: string;
      unidad?: string;
    };
    reserva?: boolean;
    baja?: boolean;
    vencimientoCarga?: string;
    vencimientoPH?: string;
  };
  nombre?: string;
  ubicacion?: string;
  codigo?: string;
  deshabilitado: boolean;
  fechaDeshabilitacion?: string;
  activo: boolean;
  ultimoRelevamiento?: string;
}

export const puestoService = {
  // Obtener todos los puestos
  getAll: async (): Promise<Puesto[]> => {
    const endpoint = createUrlWithCenterId('/api/Puestos');
    return await apiRequest(endpoint);
  },

  // Obtener puesto por ID
  getById: async (id: number): Promise<Puesto> => {
    const endpoint = createUrlWithCenterId(`/api/Puestos/${id}`);
    return await apiRequest(endpoint);
  },

  // Obtener puestos por sucursal
  getBySucursal: async (sucursalId: number): Promise<Puesto[]> => {
    const endpoint = createUrlWithCenterId('/api/Puestos/sucursal', { sucursalId: sucursalId.toString() });
    return await apiRequest(endpoint);
  },

  // Obtener puestos por extintor
  getByExtintor: async (extintorId: number): Promise<Puesto[]> => {
    const endpoint = createUrlWithCenterId('/api/Puestos/extintor', { extintorId: extintorId.toString() });
    return await apiRequest(endpoint);
  },

  // Crear puesto
  create: async (puesto: Omit<Puesto, 'id'>): Promise<Puesto> => {
    const endpoint = createUrlWithCenterId('/api/Puestos');
    return await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(puesto)
    });
  },

  // Actualizar puesto
  update: async (id: number, puesto: Partial<Puesto>): Promise<void> => {
    const endpoint = createUrlWithCenterId(`/api/Puestos/${id}`);
    await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(puesto)
    });
  },

  // Eliminar puesto (borrado lógico)
  delete: async (id: number): Promise<{ message: string }> => {
    const endpoint = createUrlWithCenterId(`/api/Puestos/${id}`);
    return await apiRequest(endpoint, {
      method: 'DELETE'
    });
  }
};
