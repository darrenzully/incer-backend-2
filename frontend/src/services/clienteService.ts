import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface Permission {
  id: number;
  name: string;
  description?: string;
  activo: boolean;
}

export interface Cliente {
  id: number;
  numero: number;
  tipoDeClienteId: number;
  tipoDeCliente?: TipoDeCliente;
  tipoDeServicioId: number;
  tipoDeServicio?: TipoDeServicio;
  centroId: number;
  centro?: Center;
  nombre: string;
  cuit: string;
  telefono?: string;
  razonSocial?: string;
  vendedorId: number;
  vendedor?: User;
  activo: boolean;
  fechaCreacion: string;
  fechaUpdate?: string;
  usuarioCreacion: string;
  usuarioUpdate?: string;
  alcances?: ClienteAlcance[];
  alcancesDetalles?: ClienteAlcanceDetalle[];
  archivos?: Archivo[];
  clienteArchivos?: ClienteArchivo[];
}

export interface TipoDeCliente {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}



export interface TipoDeServicio {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface ClienteAlcance {
  id: number;
  clienteId: number;
  tipoDeProductoId: number;
  tipoDeProducto?: TipoProducto;
  tipoDeElementoId?: number;
  tipoDeElemento?: TipoElemento;
  tipoDeServicioId?: number;
  tipoDeServicio?: TipoDeServicio;
  periodicidadId: number;
  periodicidad?: Periodicidad;
}

export interface ClienteAlcanceDetalle {
  id: number;
  clienteId: number;
  alcanceDetalleId: number;
  alcanceDetalle?: AlcanceDetalle;
}



export interface TipoElemento {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Periodicidad {
  id: number;
  nombre: string;
  descripcion?: string;
  dias: number;
  activo: boolean;
}

export interface AlcanceDetalle {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Archivo {
  id: number;
  nombre: string;
  descripcion?: string;
  ruta: string;
  tipo: string;
  tamaño: number;
  activo: boolean;
}

export interface ClienteArchivo {
  id: number;
  clienteId: number;
  archivoId: number;
  archivo?: Archivo;
  cliente?: Cliente;
  activo: boolean;
}

export interface Center {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface User {
  id: number;
  alias: string;
  email: string;
  activo: boolean;
  roleId: number;
  centers: Center[];
  permissions: Permission[];
}

export const clienteService = {
  // Obtener todos los clientes
  getClientes: async (): Promise<Cliente[]> => {
    const endpoint = createUrlWithCenterId('/api/clientes');
    return await apiRequest(endpoint);
  },

  // Obtener todos los clientes para administración
  getClientesForAdmin: async (centerId?: number | null): Promise<Cliente[]> => {
    const endpoint = createUrlWithCenterId('/api/clientes/admin', undefined, centerId);
    return await apiRequest(endpoint);
  },

  // Obtener cliente por ID
  getCliente: async (id: number): Promise<Cliente> => {
    const endpoint = createUrlWithCenterId(`/api/clientes/${id}`);
    return await apiRequest(endpoint);
  },

  // Crear cliente
  createCliente: async (cliente: Omit<Cliente, 'id' | 'numero' | 'fechaCreacion' | 'usuarioCreacion'>): Promise<Cliente> => {
    return await apiRequest('/api/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  },

  // Actualizar cliente
  updateCliente: async (id: number, cliente: Partial<Cliente>): Promise<void> => {
    await apiRequest(`/api/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  },

  // Eliminar cliente (borrado lógico)
  deleteCliente: async (id: number): Promise<{ message: string }> => {
    return await apiRequest(`/api/clientes/${id}`, {
      method: 'DELETE',
    });
  },

  // Reactivar cliente
  reactivarCliente: async (id: number): Promise<{ message: string }> => {
    return await apiRequest(`/api/clientes/${id}/reactivar`, {
      method: 'PUT',
    });
  },

  // Obtener clientes por vendedor
  getClientesByVendedor: async (vendedorId: number): Promise<Cliente[]> => {
    return await apiRequest(`/api/clientes/vendedor/${vendedorId}`);
  },

  // Obtener clientes por centro
  getClientesByCentro: async (centroId: number): Promise<Cliente[]> => {
    return await apiRequest(`/api/clientes/centro/${centroId}`);
  },

  // Obtener tipos de cliente
  getTiposCliente: async (): Promise<TipoDeCliente[]> => {
    return await apiRequest('/api/clientes/tipos-cliente');
  },

  // Obtener tipos de servicio
  getTiposServicio: async (): Promise<TipoDeServicio[]> => {
    return await apiRequest('/api/clientes/tipos-servicio');
  },

  // Obtener centros
  getCentros: async (): Promise<Center[]> => {
    const raw = await apiRequest('/api/clientes/centros');
    // Normaliza campos desde la API (Name/Description/Active) al modelo del front (nombre/descripcion/activo)
    return (raw || []).map((c: any) => ({
      id: c.id,
      nombre: c.nombre ?? c.name ?? c.Nombre ?? '',
      descripcion: c.descripcion ?? c.description ?? c.Descripcion ?? '',
      activo: c.activo ?? c.active ?? true
    }));
  },

  // Obtener vendedores
  getVendedores: async (): Promise<User[]> => {
    return await apiRequest('/api/clientes/vendedores');
  },



  // Obtener tipos de producto
  getTiposProducto: async (): Promise<TipoProducto[]> => {
    return await apiRequest('/api/clientes/tipos-producto');
  },

  // Obtener periodicidades
  getPeriodicidades: async (): Promise<Periodicidad[]> => {
    return await apiRequest('/api/clientes/periodicidades');
  }
}; 