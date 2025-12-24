import { useState, useMemo, useCallback } from 'react';
import { usePermissions } from './usePermissions';

export interface CenterFilterable {
  centerId?: number;
  [key: string]: any;
}

export const useCenterFilteredData = <T extends CenterFilterable>(
  data: T[],
  centerIdField: string = 'centerId'
) => {
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const { accessibleCenters, hasPermission } = usePermissions();

  // Filtrar datos por centro seleccionado
  const filteredData = useMemo(() => {
    if (!selectedCenter) return data;
    
    return data.filter(item => {
      const itemCenterId = item[centerIdField];
      return itemCenterId === selectedCenter;
    });
  }, [data, selectedCenter, centerIdField]);

  // Obtener centros únicos de los datos
  const availableCenters = useMemo(() => {
    const centerIds = new Set<number>();
    
    // Asegurar que accessibleCenters sea un array
    if (!Array.isArray(accessibleCenters)) {
      console.warn('accessibleCenters is not an array:', accessibleCenters);
      return [];
    }
    
    data.forEach(item => {
      const centerId = item[centerIdField];
      if (centerId && accessibleCenters.includes(centerId)) {
        centerIds.add(centerId);
      }
    });
    
    return Array.from(centerIds);
  }, [data, centerIdField, accessibleCenters]);

  // Verificar si el usuario puede ver todos los centros
  const canViewAllCenters = useMemo(() => {
    try {
      return hasPermission('*', '*') || hasPermission('centers', 'view-all');
    } catch (error) {
      console.warn('Error checking permissions:', error);
      return false;
    }
  }, [hasPermission]);

  // Cambiar centro seleccionado
  const changeCenter = useCallback((centerId: number | null) => {
    setSelectedCenter(centerId);
  }, []);

  // Limpiar filtro de centro
  const clearCenterFilter = useCallback(() => {
    setSelectedCenter(null);
  }, []);

  // Obtener estadísticas de datos por centro
  const centerStats = useMemo(() => {
    const stats: Record<number, number> = {};
    
    data.forEach(item => {
      const centerId = item[centerIdField];
      if (centerId) {
        stats[centerId] = (stats[centerId] || 0) + 1;
      }
    });
    
    return stats;
  }, [data, centerIdField]);

  return {
    selectedCenter,
    filteredData,
    availableCenters,
    canViewAllCenters,
    centerStats,
    changeCenter,
    clearCenterFilter,
    totalItems: data.length,
    filteredItems: filteredData.length
  };
};
