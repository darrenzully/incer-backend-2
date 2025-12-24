import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface ReporteNoConformeItem {
  checkListDetalleId: number;
  orden: number;
  item: string;
  cantidad: number;
}

export interface ReporteRemito {
  id: number;
  fecha: string;
  choferNombre: string;
  clienteNombre: string;
  observaciones?: string;
  firmaOperadorBase64?: string | null;
  firmaEncargadoBase64?: string | null;
}

export interface ReportePuestosRelevadosRow {
  puesto?: string;
  datosDelMatafuego?: string;
  fecha: string;
  resultadosPorItem: Record<string, string | null>;
}

export interface ReporteElementosRelevadosRow {
  datosDelElemento?: string;
  interno?: number | null;
  ubicacion?: string | null;
  fecha: string;
  resultadosPorItem: Record<string, string | null>;
}

export interface ReportePuestosRelevados {
  fechaDesde: string;
  fechaHasta: string;
  sucursalId: number;
  noConforme: ReporteNoConformeItem[];
  remitos: ReporteRemito[];
  detalles: ReportePuestosRelevadosRow[];
}

export interface ReporteElementosRelevados {
  fechaDesde: string;
  fechaHasta: string;
  sucursalId: number;
  tipoDeElementoId: number;
  noConforme: ReporteNoConformeItem[];
  remitos: ReporteRemito[];
  detalles: ReporteElementosRelevadosRow[];
}

export const reportesService = {
  getPuestosRelevados: async (params: {
    sucursalId: number;
    fechaDesde: string; // YYYY-MM-DD
    fechaHasta: string; // YYYY-MM-DD
    includeFirmas?: boolean;
  }): Promise<ReportePuestosRelevados> => {
    const endpoint = createUrlWithCenterId('/api/reportes/puestos-relevados', {
      sucursalId: params.sucursalId.toString(),
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      includeFirmas: params.includeFirmas ? 'true' : 'false',
    });
    return await apiRequest(endpoint);
  },

  getElementosRelevados: async (params: {
    sucursalId: number;
    tipoDeElementoId: number;
    fechaDesde: string; // YYYY-MM-DD
    fechaHasta: string; // YYYY-MM-DD
    includeFirmas?: boolean;
  }): Promise<ReporteElementosRelevados> => {
    const endpoint = createUrlWithCenterId('/api/reportes/elementos-relevados', {
      sucursalId: params.sucursalId.toString(),
      tipoDeElementoId: params.tipoDeElementoId.toString(),
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      includeFirmas: params.includeFirmas ? 'true' : 'false',
    });
    return await apiRequest(endpoint);
  },
};


