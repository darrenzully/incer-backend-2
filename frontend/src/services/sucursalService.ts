import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface Sucursal {
  id: number;
  clienteId: number;
  cliente?: {
    id: number;
    nombre: string;
  };
  nombre: string;
  direccion?: string;
  telefono?: string;
  localidadId: number;
  localidad?: {
    id: number;
    nombre: string;
    provincia?: {
      id: number;
      nombre: string;
      codigo: string;
      paisId: number;
    };
  };
  mapaDePuestos?: string;
  activo: boolean;
  mail?: string;
}

export interface Localidad {
  id: number;
  nombre: string;
  provinciaId: number;
  provincia?: {
    id: number;
    nombre: string;
    codigo: string;
    paisId: number;
  };
}

export interface Provincia {
  id: number;
  nombre: string;
  codigo: string;
  paisId: number;
}

export interface Pais {
  id: number;
  nombre: string;
  codigo: string;
}

export const sucursalService = {
  // Obtener todas las sucursales
  getAll: async (): Promise<Sucursal[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales');
    return await apiRequest(endpoint);
  },

  // Obtener sucursal por ID
  getById: async (id: number): Promise<Sucursal> => {
    const endpoint = createUrlWithCenterId(`/api/Sucursales/${id}`);
    return await apiRequest(endpoint);
  },

  // Obtener sucursales por cliente
  getByClienteId: async (clienteId: number): Promise<Sucursal[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/cliente', { clienteId: clienteId.toString() });
    return await apiRequest(endpoint);
  },

  // Obtener sucursales activas
  getActivas: async (): Promise<Sucursal[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/activas');
    return await apiRequest(endpoint);
  },

  // Crear nueva sucursal
  create: async (sucursal: Omit<Sucursal, 'id'>): Promise<Sucursal> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales');
    return await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(sucursal)
    });
  },

  // Actualizar sucursal
  update: async (id: number, sucursal: Partial<Sucursal>): Promise<void> => {
    const endpoint = createUrlWithCenterId(`/api/Sucursales/${id}`);
    await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(sucursal)
    });
  },

  // Eliminar sucursal (borrado lógico)
  delete: async (id: number): Promise<{ message: string }> => {
    const endpoint = createUrlWithCenterId(`/api/Sucursales/${id}`);
    return await apiRequest(endpoint, {
      method: 'DELETE'
    });
  },

  // Reactivar sucursal
  reactivar: async (id: number): Promise<{ message: string }> => {
    const endpoint = createUrlWithCenterId(`/api/Sucursales/${id}/reactivar`);
    return await apiRequest(endpoint, {
      method: 'PUT'
    });
  },

  // Obtener localidades por provincia
  getLocalidadesByProvincia: async (provinciaId: number): Promise<Localidad[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/localidades', { provinciaId: provinciaId.toString() });
    return await apiRequest(endpoint);
  },

  // Obtener provincias por país
  getProvinciasByPais: async (paisId: number): Promise<Provincia[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/provincias', { paisId: paisId.toString() });
    return await apiRequest(endpoint);
  },

  // Obtener países
  getPaises: async (): Promise<Pais[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/paises');
    return await apiRequest(endpoint);
  },

  // Obtener provincias
  getProvincias: async (): Promise<Provincia[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/provincias');
    return await apiRequest(endpoint);
  },

  // Obtener localidades
  getLocalidades: async (): Promise<Localidad[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/localidades');
    return await apiRequest(endpoint);
  },

  // Obtener clientes
  getClientes: async (): Promise<any[]> => {
    const endpoint = createUrlWithCenterId('/api/Sucursales/clientes');
    return await apiRequest(endpoint);
  }
}; 