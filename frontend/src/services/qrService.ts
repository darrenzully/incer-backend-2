import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface QrProducto {
  id: number;
  productoId: number;
  codigo: string;
  cliente: string;
  sucursal: string;
  tipoProducto: string;
  tipoElemento?: string;
  producto: string;
}

export interface QR {
  id: number;
  codigo: string;
  url: string;
  activo: boolean;
}

export const qrService = {
  // Obtener productos con QR del centro
  async getProductos(): Promise<QrProducto[]> {
    console.log('=== QR SERVICE DEBUG ===');
    const centerId = localStorage.getItem('currentCenterId');
    console.log('CenterId del localStorage:', centerId);
    
    const endpoint = createUrlWithCenterId('/api/QRs/productos');
    console.log('Endpoint generado:', endpoint);
    console.log('========================');
    
    return await apiRequest(endpoint);
  },

  // Obtener todos los QR del centro
  async getAll(): Promise<QR[]> {
    const endpoint = createUrlWithCenterId('/api/QRs');
    return await apiRequest(endpoint);
  },

  // Obtener QR por ID
  async getById(id: number): Promise<QR> {
    const endpoint = createUrlWithCenterId(`/api/QRs/${id}`);
    return await apiRequest(endpoint);
  },

  // Crear QR
  async create(qr: Omit<QR, 'id'>): Promise<void> {
    const endpoint = createUrlWithCenterId('/api/QRs');
    await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(qr)
    });
  },

  // Generar códigos QR para productos sin código
  async generateCodes(): Promise<void> {
    const endpoint = createUrlWithCenterId('/api/QRs/generateCodes');
    await apiRequest(endpoint, {
      method: 'POST'
    });
  }
};
