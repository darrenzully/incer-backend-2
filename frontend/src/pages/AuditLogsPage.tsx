import React, { useState, useEffect } from 'react';
// import { useUserAccesses } from '../hooks/useSecurity'; // Temporalmente deshabilitado
import Notification from '../components/Notification';
import { 
  EyeIcon, 
  CalendarIcon,
  UserIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  userId: number;
  userEmail: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  oldValues?: string;
  newValues?: string;
  success: boolean;
  errorMessage?: string;
}

interface AuditLogsPageProps {
  userId?: number;
}

export const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ userId }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterType, setFilterType] = useState<'system' | 'user' | 'entity'>('system');
  const [filterUserId, setFilterUserId] = useState<number>(userId || 0);
  const [filterEntityType, setFilterEntityType] = useState<string>('');
  const [filterEntityId, setFilterEntityId] = useState<number>(0);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    loadAuditLogs();
  }, [filterType, filterUserId, filterEntityType, filterEntityId, fromDate, toDate]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      let logs: AuditLog[] = [];

      switch (filterType) {
        case 'user':
          if (filterUserId > 0) {
            const from = fromDate ? new Date(fromDate) : undefined;
            const to = toDate ? new Date(toDate) : undefined;
            // TODO: Implementar llamada a la API de auditoría
            // logs = await auditService.getUserAuditLogs(filterUserId, from, to);
          }
          break;
        case 'entity':
          if (filterEntityType && filterEntityId > 0) {
            // TODO: Implementar llamada a la API de auditoría
            // logs = await auditService.getEntityAuditLogs(filterEntityType, filterEntityId);
          }
          break;
        default:
          // TODO: Implementar llamada a la API de auditoría
          // logs = await auditService.getSystemAuditLogs(fromDate ? new Date(fromDate) : undefined, toDate ? new Date(toDate) : undefined);
          break;
      }

      setAuditLogs(logs);
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al cargar los logs de auditoría' });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'login':
        return '🔑';
      case 'logout':
        return '🚪';
      default:
        return '📝';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'userappaccess':
        return <ComputerDesktopIcon className="w-5 h-5" />;
      case 'usercenterappaccess':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'app':
        return <ComputerDesktopIcon className="w-5 h-5" />;
      default:
        return <EyeIcon className="w-5 h-5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'login':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Logs de Auditoría
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Rastrea todas las acciones y cambios en el sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filtros
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo de filtro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Filtro
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'system' | 'user' | 'entity')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="system">Sistema</option>
              <option value="user">Por Usuario</option>
              <option value="entity">Por Entidad</option>
            </select>
          </div>

          {/* Filtros específicos según el tipo */}
          {filterType === 'user' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID de Usuario
              </label>
              <input
                type="number"
                value={filterUserId}
                onChange={(e) => setFilterUserId(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="ID del usuario"
              />
            </div>
          )}

          {filterType === 'entity' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Entidad
                </label>
                <input
                  type="text"
                  value={filterEntityType}
                  onChange={(e) => setFilterEntityType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: UserAppAccess"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID de Entidad
                </label>
                <input
                  type="number"
                  value={filterEntityId}
                  onChange={(e) => setFilterEntityId(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="ID de la entidad"
                />
              </div>
            </>
          )}

          {/* Fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Logs de auditoría */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Logs de Auditoría ({auditLogs.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron logs de auditoría
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getActionIcon(log.action)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getEntityIcon(log.entityType)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          {log.entityType}
                          {log.entityId && ` #${log.entityId}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {log.userEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.success 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {log.success ? 'Éxito' : 'Error'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};
