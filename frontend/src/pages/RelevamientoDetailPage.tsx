import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { relevamientoService, Relevamiento, RelevamientoDetalle, getEstadoColor } from '../services/relevamientoService';
import Notification from '../components/Notification';
import DataTable from '../components/DataTable';

const RelevamientoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [relevamiento, setRelevamiento] = useState<Relevamiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedDetalle, setSelectedDetalle] = useState<RelevamientoDetalle | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadRelevamiento();
    }
  }, [id]);

  const loadRelevamiento = async () => {
    try {
      setLoading(true);
      const data = await relevamientoService.getById(Number(id));
      // Los datos se cargan correctamente
      setRelevamiento(data);
    } catch (error) {
      console.error('Error loading relevamiento:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar el relevamiento'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetalle = (detalle: RelevamientoDetalle) => {
    console.log('=== MODAL DEBUG ===');
    console.log('Detalle seleccionado:', detalle);
    console.log('PuestoCompleto:', (detalle as any).puestoCompleto);
    console.log('ProductoSerie:', (detalle as any).productoSerie);
    console.log('PuestoNombre:', (detalle as any).puestoNombre);
    console.log('PuestoUbicacion:', (detalle as any).puestoUbicacion);
    console.log('==================');
    setSelectedDetalle(detalle);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDetalle(null);
  };

  const handleDownloadRemito = () => {
    // TODO: Implementar descarga del remito manual
    console.log('Descargar remito manual');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!relevamiento) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Relevamiento no encontrado</p>
        <button
          onClick={() => navigate('/relevamientos')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Volver a Relevamientos
        </button>
      </div>
    );
  }

  // Configuración de columnas para la tabla de detalles
  const getResultados = (row: RelevamientoDetalle) => {
    // El DTO del backend usa detalleResultados (con d minúscula)
    return (row as any).detalleResultados || (row as any).DetalleResultados || row.relevamientoDetalleResultados || [];
  };

  const getValorPorTitulo = (row: RelevamientoDetalle, ...keywords: string[]) => {
    const resultados: any[] = getResultados(row) || [];
    const kw = keywords.map(k => k.toLowerCase());
    const found = resultados.find((r: any) => {
      const titulo = (r.checkListDetalleTitulo || r.checkListDetalleItem || '').toLowerCase();
      return kw.every(k => titulo.includes(k));
    });
    return found?.valor;
  };

  const formatBool = (valor?: string) => {
    if (valor == null) return undefined;
    const v = valor.toString().trim().toLowerCase();
    if (['true', 'si', 'sí', '1', 'ok'].includes(v)) return 'True';
    if (['false', 'no', '0'].includes(v)) return 'False';
    return valor; // dejar como viene si no es claramente booleano
  };

  const formatDate = (valor?: string) => {
    if (!valor) return undefined;
    const d = new Date(valor);
    if (isNaN(d.getTime())) return valor;
    return d.toLocaleDateString();
  };

  const detalleColumns = [
    {
      key: 'puesto',
      label: 'Puesto',
      render: (_: any, row: RelevamientoDetalle) => (row as any).puestoNombre || 'N/A'
    },
    {
      key: 'ubicacion',
      label: 'Ubicación',
      render: (_: any, row: RelevamientoDetalle) => (row as any).productoUbicacion || 'N/A'
    },
    {
      key: 'extintor',
      label: 'Extintor',
      render: (_: any, row: RelevamientoDetalle) => (row as any).productoSerie || 'N/A'
    },
    {
      key: 'reserva',
      label: 'Reserva',
      render: (_: any, row: RelevamientoDetalle) => {
        const valor = (row as any).productoReserva;
        const boolText = formatBool(valor);
        return boolText || 'N/A';
      }
    },
    {
      key: 'vencimientoCarga',
      label: 'Venc. carga',
      render: (_: any, row: RelevamientoDetalle) => {
        const valor = (row as any).productoVencimientoCarga;
        const formatted = formatDate(valor);
        return formatted || 'N/A';
      }
    },
    {
      key: 'vencimientoPH',
      label: 'Venc. PH',
      render: (_: any, row: RelevamientoDetalle) => {
        const valor = (row as any).productoVencimientoPH;
        const formatted = formatDate(valor);
        return formatted || 'N/A';
      }
    }
  ];

  const detalleActions = [
    {
      label: 'Ver',
      icon: EyeIcon,
      onClick: handleViewDetalle,
      className: 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
    }
  ];

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/relevamientos')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="Volver"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Detalle de Relevamiento
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Información completa del relevamiento
            </p>
          </div>
        </div>
      </div>

      {/* Información Principal */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <p className="text-gray-900 dark:text-white">{(relevamiento as any).tipoDeProductoNombre || 'N/A'}</p>
            </div>

            {/* 2. Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
              <p className="text-gray-900 dark:text-white">{(relevamiento as any).clienteNombre || 'N/A'}</p>
            </div>

            {/* 3. Sucursal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sucursal</label>
              <p className="text-gray-900 dark:text-white">{(relevamiento as any).sucursalNombre || 'N/A'}</p>
            </div>

            {/* 4. Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <p className="text-gray-900 dark:text-white">{(relevamiento as any).descripcion || 'N/A'}</p>
            </div>

            {/* 5. Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                (relevamiento as any).estadoTareaNombre ? getEstadoColor((relevamiento as any).estadoTareaNombre) : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {(relevamiento as any).estadoTareaNombre || 'N/A'}
              </span>
            </div>

            {/* 6. Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
              <p className="text-gray-900 dark:text-white">{relevamiento.fecha ? new Date(relevamiento.fecha).toLocaleDateString() : 'N/A'}</p>
            </div>

            {/* 6b. Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
              <p className="text-gray-900 dark:text-white">{relevamiento.fechaFin ? new Date(relevamiento.fechaFin).toLocaleDateString() : 'N/A'}</p>
            </div>

            {/* 7. Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
              <p className="text-gray-900 dark:text-white">
                {(() => {
                  const apellido = (relevamiento as any)?.usuarioApellido;
                  const nombre = (relevamiento as any)?.usuarioNombre;
                  const nombreCompleto = apellido && nombre ? `${apellido}, ${nombre}` : undefined;
                  return nombreCompleto || 'N/A';
                })()}
              </p>
            </div>

            {/* 8. Remito Manual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remito Manual</label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900 dark:text-white">
                  {relevamiento.remitoId ? `Remito #${relevamiento.remitoId}` : 'N/A'}
                </span>
                {relevamiento.remitoId && (
                  <button
                    onClick={handleDownloadRemito}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Descargar remito manual"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {/* 9. Leyenda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leyenda</label>
              <p className="text-gray-900 dark:text-white">{relevamiento.leyenda || 'N/A'}</p>
            </div>
            {/* 10. Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <p className="text-gray-900 dark:text-white">{relevamiento.descripcion || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Items del Relevamiento */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Items del Relevamiento
          </h2>
        </div>
        <div className="p-6">
          {relevamiento.relevamientoDetalles && relevamiento.relevamientoDetalles.length > 0 ? (
            <DataTable
              data={relevamiento.relevamientoDetalles}
              columns={detalleColumns}
              actions={detalleActions}
              searchPlaceholder="Buscar por puesto, ubicación o extintor..."
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No hay items de relevamiento disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para ver detalles del item */}
      {showModal && selectedDetalle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detalles
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Puesto</label>
                    <p className="text-gray-900 dark:text-white">
                      {(() => {
                        const puestoCompleto = (selectedDetalle as any).puestoCompleto;
                        console.log('Modal - PuestoCompleto:', puestoCompleto);
                        return puestoCompleto || 'N/A';
                      })()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Extintor</label>
                    <p className="text-gray-900 dark:text-white">
                      {(() => {
                        const productoSerie = (selectedDetalle as any).productoSerie;
                        console.log('Modal - ProductoSerie:', productoSerie);
                        return productoSerie || 'N/A';
                      })()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Checklist</label>
                  <div className="space-y-2">
                    {(() => {
                      const resultados = getResultados(selectedDetalle) || [];
                      
                      // Agrupar por título del checklist
                      const grupos = resultados.reduce((acc: any, resultado: any) => {
                        const titulo = resultado.checkListDetalleTitulo || 'Sin título';
                        if (!acc[titulo]) {
                          acc[titulo] = [];
                        }
                        acc[titulo].push(resultado);
                        return acc;
                      }, {});
                      
                      return Object.entries(grupos).map(([titulo, items]: [string, any]) => (
                        <div key={titulo} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                          <button
                            className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg flex items-center justify-between"
                            onClick={() => {
                              const element = document.getElementById(`collapse-${titulo}`);
                              if (element) {
                                element.classList.toggle('hidden');
                              }
                            }}
                          >
                            <span className="font-medium text-gray-900 dark:text-white">{titulo}</span>
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div id={`collapse-${titulo}`} className="hidden">
                            <div className="bg-white dark:bg-gray-800">
                              {/* Headers de la tabla */}
                              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  <div>Item</div>
                                  <div>Conforme</div>
                                  <div>Valor</div>
                                  <div>Imagen</div>
                                </div>
                              </div>
                              
                              {/* Items del checklist */}
                              <div className="px-4 py-2">
                                {items.map((item: any, index: number) => (
                                  <div key={index} className="grid grid-cols-4 gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0 items-center">
                                    {/* Item */}
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {item.checkListDetalleItem || 'N/A'}
                                    </div>
                                    
                                    {/* Conforme */}
                                    <div>
                                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        item.conformidad === true
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                          : item.conformidad === false
                                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      }`}>
                                        {item.conformidad === true ? 'Sí' : item.conformidad === false ? 'No' : 'Parcial'}
                                      </span>
                                    </div>
                                    
                                    {/* Valor */}
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      <div className="max-w-xs truncate" title={item.valor}>
                                        {item.valor || 'N/A'}
                                      </div>
                                    </div>
                                    
                                    {/* Imagen */}
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {item.archivoNombre ? (
                                        <button
                                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                          onClick={() => {
                                            // TODO: Implementar visualización de imagen
                                            alert('Funcionalidad de imagen pendiente de implementar');
                                          }}
                                        >
                                          Ver imagen
                                        </button>
                                      ) : (
                                        'N/A'
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelevamientoDetailPage;
