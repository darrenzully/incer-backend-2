import { apiRequest, createUrlWithCenterId } from '../utils/apiHelpers';

export interface DashboardStats {
  totalUsers: number;
  totalCenters: number;
  totalClients: number;
  totalSucursales: number;
  totalExtintores: number;
  totalElementos: number;
  totalPuestos: number;
  activeExtintores: number;
  inactiveExtintores: number;
  pendingTasks: number;
  ordersInProcess: number;
}

export interface DashboardActivity {
  id: number;
  action: string;
  user: string;
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface DashboardChartData {
  name: string;
  usuarios: number;
  centros: number;
  productos: number;
}

export interface DashboardPieData {
  name: string;
  value: number;
  color: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      clients,
      sucursales,
      extintores,
      elementos,
      puestos
    ] = await Promise.all([
      apiRequest(createUrlWithCenterId('/api/clientes')),
      apiRequest(createUrlWithCenterId('/api/sucursales')),
      apiRequest(createUrlWithCenterId('/api/extintores')),
      apiRequest(createUrlWithCenterId('/api/elementos')),
      apiRequest(createUrlWithCenterId('/api/puestos'))
    ]);

    const activeExtintores = extintores.filter((e: any) => e.activo).length;
    const inactiveExtintores = extintores.filter((e: any) => !e.activo).length;

    return {
      totalUsers: 0, // No incluimos usuarios globales en el dashboard por centro
      totalCenters: 1, // Solo mostramos el centro actual
      totalClients: clients.length || 0,
      totalSucursales: sucursales.length || 0,
      totalExtintores: extintores.length || 0,
      totalElementos: elementos.length || 0,
      totalPuestos: puestos.length || 0,
      activeExtintores,
      inactiveExtintores,
      pendingTasks: Math.floor(Math.random() * 10) + 1, // TODO: Implementar endpoint real
      ordersInProcess: Math.floor(Math.random() * 20) + 10 // TODO: Implementar endpoint real
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Retornar datos por defecto en caso de error
    return {
      totalUsers: 0,
      totalCenters: 0,
      totalClients: 0,
      totalSucursales: 0,
      totalExtintores: 0,
      totalElementos: 0,
      totalPuestos: 0,
      activeExtintores: 0,
      inactiveExtintores: 0,
      pendingTasks: 0,
      ordersInProcess: 0
    };
  }
}

export async function getDashboardChartData(): Promise<DashboardChartData[]> {
  try {
    // TODO: Implementar endpoint real para datos de gráficos
    // Por ahora retornamos datos simulados basados en estadísticas reales
    const stats = await getDashboardStats();
    
    return [
      { name: 'Ene', usuarios: Math.floor(stats.totalUsers * 0.8), centros: Math.floor(stats.totalCenters * 0.7), productos: Math.floor((stats.totalExtintores + stats.totalElementos) * 0.6) },
      { name: 'Feb', usuarios: Math.floor(stats.totalUsers * 0.9), centros: Math.floor(stats.totalCenters * 0.8), productos: Math.floor((stats.totalExtintores + stats.totalElementos) * 0.7) },
      { name: 'Mar', usuarios: Math.floor(stats.totalUsers * 0.95), centros: Math.floor(stats.totalCenters * 0.9), productos: Math.floor((stats.totalExtintores + stats.totalElementos) * 0.8) },
      { name: 'Abr', usuarios: Math.floor(stats.totalUsers * 0.98), centros: Math.floor(stats.totalCenters * 0.95), productos: Math.floor((stats.totalExtintores + stats.totalElementos) * 0.9) },
      { name: 'May', usuarios: Math.floor(stats.totalUsers * 0.99), centros: Math.floor(stats.totalCenters * 0.98), productos: Math.floor((stats.totalExtintores + stats.totalElementos) * 0.95) },
      { name: 'Jun', usuarios: stats.totalUsers, centros: stats.totalCenters, productos: stats.totalExtintores + stats.totalElementos },
    ];
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return [];
  }
}

export async function getDashboardPieData(): Promise<DashboardPieData[]> {
  try {
    const stats = await getDashboardStats();
    
    return [
      { name: 'Activos', value: stats.activeExtintores + stats.totalElementos + stats.totalPuestos, color: '#10B981' },
      { name: 'Inactivos', value: stats.inactiveExtintores, color: '#EF4444' },
      { name: 'Pendientes', value: stats.pendingTasks, color: '#F59E0B' },
    ];
  } catch (error) {
    console.error('Error fetching pie data:', error);
    return [];
  }
}

export async function getDashboardActivities(): Promise<DashboardActivity[]> {
  try {
    // TODO: Implementar endpoint real para actividades recientes
    // Por ahora retornamos actividades simuladas
    return [
      { id: 1, action: 'Nuevo centro agregado', user: 'Admin Sistema', time: '2 min ago', type: 'success' },
      { id: 2, action: 'Usuario actualizado', user: 'María González', time: '5 min ago', type: 'info' },
      { id: 3, action: 'Cliente creado', user: 'Juan Pérez', time: '10 min ago', type: 'success' },
      { id: 4, action: 'Extintor registrado', user: 'Carlos López', time: '15 min ago', type: 'info' },
    ];
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}
