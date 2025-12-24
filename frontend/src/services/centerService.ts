const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5124';

export interface Center {
  id: number;
  name: string;
  description: string;
  activo: boolean;
}

export async function getCenters(): Promise<Center[]> {
  const res = await fetch(`${API_URL}/api/businesscenters/accessible`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Error fetching centers');
  const data = await res.json();
  
  // Mapear los datos del backend y agregar el campo activo
  return data.map((center: any) => ({
    id: center.id,
    name: center.name,
    description: center.description,
    activo: center.activo || true // Usar el campo activo del backend o true por defecto
  }));
}

export async function getCenter(id: number): Promise<Center> {
  // Por ahora simulamos la obtención de un centro específico
  // En el futuro esto debería ser un endpoint real
  const centers = await getCenters();
  const center = centers.find(c => c.id === id);
  if (!center) {
    throw new Error('Centro no encontrado');
  }
  return center;
}

export async function createCenter(center: { 
  name: string; 
  description: string; 
  activo?: boolean;
}): Promise<Center> {
  // Por ahora simulamos la creación de un centro
  // En el futuro esto debería ser un endpoint real
  const newCenter: Center = {
    id: Date.now(), // ID temporal
    name: center.name,
    description: center.description,
    activo: center.activo ?? true // Por defecto activo
  };
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return newCenter;
}

export async function updateCenter(center: { 
  id: number; 
  name: string; 
  description: string; 
  activo?: boolean;
}): Promise<void> {
  // Por ahora simulamos la actualización de un centro
  // En el futuro esto debería ser un endpoint real
  console.log('Actualizando centro:', center);
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
}

export async function deleteCenter(id: number): Promise<void> {
  // Por ahora simulamos la eliminación de un centro
  // En el futuro esto debería ser un endpoint real
  console.log('Eliminando centro:', id);
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));
} 