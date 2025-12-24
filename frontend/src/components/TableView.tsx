import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableViewProps {
  data: any[];
  columns: Column[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  viewPath?: string;
  editPath?: string;
  itemName?: string;
  className?: string;
}

const TableView: React.FC<TableViewProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  viewPath,
  editPath,
  itemName = 'elemento',
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {viewPath && (
                      <Link
                        to={`${viewPath}/${item.id}`}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    )}
                    {editPath && (
                      <Link
                        to={`${editPath}/${item.id}`}
                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                        title="Editar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                        title="Editar"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            No hay {itemName}s para mostrar
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comienza agregando tu primer {itemName}.
          </p>
        </div>
      )}
    </div>
  );
};

export default TableView;
