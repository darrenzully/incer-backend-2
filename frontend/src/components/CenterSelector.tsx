import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCenter } from '../contexts/CenterContext';

const CenterSelector: React.FC = () => {
  const { currentCenter, accessibleCenters, switchCenter, hasMultipleCenters, isLoading } = useCenter();

  console.log('=== CENTER SELECTOR DEBUG ===');
  console.log('isLoading:', isLoading);
  console.log('currentCenter:', currentCenter);
  console.log('accessibleCenters:', accessibleCenters);
  console.log('hasMultipleCenters:', hasMultipleCenters);
  console.log('==============================');

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">Cargando centros...</span>
      </div>
    );
  }

  if (!hasMultipleCenters || !currentCenter) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentCenter?.name || 'Sin centro'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={currentCenter.id}
        onChange={(e) => switchCenter(parseInt(e.target.value))}
        className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {accessibleCenters.map((center) => (
          <option key={center.id} value={center.id}>
            {center.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

export default CenterSelector;
