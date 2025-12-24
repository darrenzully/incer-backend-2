const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

export interface TipoElemento {
  id: number;
  nombre: string;
  activo: boolean;
  detalles?: TipoElementoDetalle[];
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

export interface TipoElementoDetalle {
  id: number;
  item: string;
  tipoDeDatoId: number;
  tipoDeDato?: TipoDato;
  tipoDeElementoId: number;
  tipoDeElemento?: TipoElemento;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

export interface TipoDato {
  id: number;
  nombre: string;
  fechaCreacion?: string;
  fechaUpdate?: string;
  usuarioCreacion?: string;
  usuarioUpdate?: string;
}

export async function getTiposElemento(): Promise<TipoElemento[]> {
  const res = await fetch(`${API_URL}/api/TiposDeElemento`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener tipos de elemento');
  return res.json();
}

export async function getTipoElemento(id: number): Promise<TipoElemento> {
  const res = await fetch(`${API_URL}/api/TiposDeElemento/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener tipo de elemento');
  return res.json();
}

export async function createTipoElemento(tipoElemento: Omit<TipoElemento, 'id'>): Promise<TipoElemento> {
  const res = await fetch(`${API_URL}/api/TiposDeElemento`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tipoElemento)
  });
  if (!res.ok) throw new Error('Error al crear tipo de elemento');
  return res.json();
}

export async function updateTipoElemento(id: number, tipoElemento: TipoElemento): Promise<void> {
  const res = await fetch(`${API_URL}/api/TiposDeElemento/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tipoElemento)
  });
  if (!res.ok) throw new Error('Error al actualizar tipo de elemento');
}

export async function deleteTipoElemento(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/TiposDeElemento/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  if (!res.ok) throw new Error('Error al eliminar tipo de elemento');
}

export async function getTiposDato(): Promise<TipoDato[]> {
  const res = await fetch(`${API_URL}/api/TiposDeDato`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener tipos de dato');
  return res.json();
}
