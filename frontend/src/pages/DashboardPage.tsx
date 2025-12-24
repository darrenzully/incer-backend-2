import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CubeIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  FireIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats, getDashboardChartData, getDashboardPieData, getDashboardActivities, DashboardStats, DashboardChartData, DashboardPieData, DashboardActivity } from '../services/dashboardService';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<DashboardChartData[]>([]);
  const [pieData, setPieData] = useState<DashboardPieData[]>([]);
  const [recentActivities, setRecentActivities] = useState<DashboardActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, chartDataData, pieDataData, activitiesData] = await Promise.all([
        getDashboardStats(),
        getDashboardChartData(),
        getDashboardPieData(),
        getDashboardActivities()
      ]);
      
      setStats(statsData);
      setChartData(chartDataData);
      setPieData(pieDataData);
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Datos para las tarjetas de estadísticas
  const statsCards = stats ? [
    {
      name: 'Total Usuarios',
      value: stats.totalUsers.toString(),
      change: '+0',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Centros',
      value: stats.totalCenters.toString(),
      change: '+0',
      changeType: 'increase' as const,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Clientes',
      value: stats.totalClients.toString(),
      change: '+0',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Total Extintores',
      value: stats.totalExtintores.toString(),
      change: '+0',
      changeType: 'increase' as const,
      icon: FireIcon,
      color: 'bg-orange-500',
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Bienvenido al panel de control de Incer</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-primary">
            Generar Reporte
          </button>
          <button className="btn-secondary">
            Exportar Datos
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          statsCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                stat.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                vs mes anterior
              </span>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Mensual</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line type="monotone" dataKey="usuarios" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="centros" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="productos" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Categoría</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar dataKey="usuarios" fill="#3B82F6" />
              <Bar dataKey="centros" fill="#10B981" />
              <Bar dataKey="productos" fill="#8B5CF6" />
            </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Pie Chart and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Centros</h3>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Activities */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad Reciente</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full mt-2 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">por {activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
          <button className="w-full mt-4 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
            Ver todas las actividades
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 dark:border-gray-600 dark:hover:border-primary-400 dark:hover:bg-primary-900/20">
            <BuildingOfficeIcon className="w-8 h-8 text-primary-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Agregar Centro</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 dark:border-gray-600 dark:hover:border-primary-400 dark:hover:bg-primary-900/20">
            <UserGroupIcon className="w-8 h-8 text-primary-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Crear Usuario</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 dark:border-gray-600 dark:hover:border-primary-400 dark:hover:bg-primary-900/20">
            <CubeIcon className="w-8 h-8 text-primary-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Nuevo Producto</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 dark:border-gray-600 dark:hover:border-primary-400 dark:hover:bg-primary-900/20">
            <ChartBarIcon className="w-8 h-8 text-primary-500 mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Generar Reporte</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 