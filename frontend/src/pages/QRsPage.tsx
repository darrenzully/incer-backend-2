import React, { useEffect, useState } from 'react';
import DataTable, { FilterConfig } from '../components/DataTable';
import ViewToggle from '../components/ViewToggle';
import { qrService, QrProducto } from '../services/qrService';

const QRsPage: React.FC = () => {
  const [data, setData] = useState<QrProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        console.log('=== QRs PAGE DEBUG ===');
        console.log('Cargando productos QR...');
        const productos = await qrService.getProductos();
        console.log('Productos recibidos:', productos);
        console.log('========================');
        setData(productos);
      } catch (error) {
        console.error('Error al cargar QRs:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reload = async () => {
    setLoading(true);
    try {
      const productos = await qrService.getProductos();
      setData(productos);
    } catch (error) {
      console.error('Error al recargar QRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      await qrService.generateCodes();
      await reload();
    } catch (error) {
      console.error('Error al generar códigos:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    { key: 'codigo', label: 'QR' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'sucursal', label: 'Sucursal' },
    { key: 'tipoProducto', label: 'Tipo de producto' },
    { key: 'tipoElemento', label: 'Tipo de inst. fija' },
    { key: 'producto', label: 'Producto' },
  ];

  // Configuración de filtros avanzados
  const filterConfig: FilterConfig[] = [
    {
      key: 'cliente',
      label: 'Cliente',
      type: 'select'
    },
    {
      key: 'sucursal',
      label: 'Sucursal',
      type: 'select'
    },
    {
      key: 'tipoProducto',
      label: 'Tipo de producto',
      type: 'select'
    },
    {
      key: 'tipoElemento',
      label: 'Tipo de instalación fija',
      type: 'select'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">QRs</h1>
          <p className="text-gray-600 dark:text-gray-400">Listado de etiquetas QR de productos</p>
        </div>
        <div className="flex items-center space-x-4">
          <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
          <div className="flex gap-2">
            <button onClick={handleGenerate} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
              Generar códigos
            </button>
            <button onClick={handlePrint} className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200">
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable 
          data={data} 
          columns={columns}
          searchPlaceholder="Buscar por sucursal..."
          filters={filterConfig}
          enableAdvancedFilters={true}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map(item => (
            <div key={`${item.tipoProducto}-${item.productoId}-${item.codigo}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {item.sucursal || '-'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.cliente || '-'}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    {item.tipoProducto}
                  </span>
                </div>
                <div className="space-y-3">
                  {item.tipoElemento && (
                    <div className="text-sm">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">Tipo inst. fija:</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.tipoElemento}</div>
                    </div>
                  )}
                  <div className="text-sm">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Producto:</div>
                    <div className="text-gray-600 dark:text-gray-300">{item.producto}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Código:</div>
                    <div className="text-gray-600 dark:text-gray-300 break-all">{item.codigo}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRsPage;


