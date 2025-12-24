import React from 'react';
import { Squares2X2Icon, TableCellsIcon } from '@heroicons/react/24/outline';

interface ViewToggleProps {
  currentView: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
  className?: string;
  gridLabel?: string;
  tableLabel?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ 
  currentView, 
  onViewChange, 
  className = '',
  gridLabel = 'Tarjetas',
  tableLabel = 'Tabla'
}) => {
  return (
    <div className={`flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          currentView === 'grid'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        title="Vista de tarjetas"
      >
        <Squares2X2Icon className="w-4 h-4 mr-2" />
        {gridLabel}
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          currentView === 'table'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
        title="Vista de tabla"
      >
        <TableCellsIcon className="w-4 h-4 mr-2" />
        {tableLabel}
      </button>
    </div>
  );
};

export default ViewToggle;
