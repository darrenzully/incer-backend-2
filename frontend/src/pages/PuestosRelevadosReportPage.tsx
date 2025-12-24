import React, { useEffect, useMemo, useState } from 'react';
import Notification from '../components/Notification';
import DataTable from '../components/DataTable';
import { clienteService, Cliente } from '../services/clienteService';
import { sucursalService, Sucursal } from '../services/sucursalService';
import { reportesService, ReportePuestosRelevados } from '../services/reportesService';

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

const downloadCsv = (filename: string, rows: string[][]) => {
  const escape = (v: any) => {
    const s = (v ?? '').toString();
    if (s.includes('"') || s.includes(',') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = rows.map(r => r.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const PuestosRelevadosReportPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [sucursalId, setSucursalId] = useState<number | ''>('');
  const [fechaDesde, setFechaDesde] = useState<string>(toISODate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const [fechaHasta, setFechaHasta] = useState<string>(toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reporte, setReporte] = useState<ReportePuestosRelevados | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await clienteService.getClientes();
        setClientes(data || []);
      } catch (e) {
        setNotification({ type: 'error', message: 'Error al cargar clientes' });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!clienteId) {
          setSucursales([]);
          setSucursalId('');
          return;
        }
        const data = await sucursalService.getByClienteId(Number(clienteId));
        setSucursales(data || []);
      } catch {
        setNotification({ type: 'error', message: 'Error al cargar sucursales' });
      }
    })();
  }, [clienteId]);

  const checklistKeys = useMemo(() => {
    const keys = (reporte?.noConforme || []).map(x => x.item);
    return keys;
  }, [reporte]);

  const detalleColumns = useMemo(() => {
    const base = [
      { key: 'puesto', label: 'Puesto' },
      { key: 'datosDelMatafuego', label: 'Datos del matafuego' },
      {
        key: 'fecha',
        label: 'Fecha',
        render: (v: any) => (v ? new Date(v).toLocaleString() : 'N/A'),
      },
    ];

    const dyn = checklistKeys.map((k) => ({
      key: k,
      label: k,
      render: (_: any, row: any) => row.resultadosPorItem?.[k] ?? '',
    }));

    return [...base, ...dyn];
  }, [checklistKeys]);

  const detalleRows = useMemo(() => {
    return (reporte?.detalles || []).map((d: any) => ({
      ...d,
      // “aplanar” keys para DataTable (solo para que el search/sort tenga key)
      ...Object.fromEntries(Object.entries(d.resultadosPorItem || {})),
    }));
  }, [reporte]);

  const remitoColumns = [
    { key: 'fecha', label: 'Fecha', render: (v: any) => (v ? new Date(v).toLocaleDateString() : 'N/A') },
    { key: 'choferNombre', label: 'Nombre del chofer' },
    {
      key: 'firmaEncargadoBase64',
      label: 'Firma del chofer',
      render: (v: any) =>
        v ? (
          <img alt="Firma chofer" className="h-10 w-10 object-cover rounded border" src={`data:image/jpeg;base64,${v}`} />
        ) : (
          <span className="text-gray-500">Sin firma</span>
        ),
    },
    { key: 'clienteNombre', label: 'Nombre del cliente' },
    {
      key: 'firmaOperadorBase64',
      label: 'Firma del cliente',
      render: (v: any) =>
        v ? (
          <img alt="Firma cliente" className="h-10 w-10 object-cover rounded border" src={`data:image/jpeg;base64,${v}`} />
        ) : (
          <span className="text-gray-500">Sin firma</span>
        ),
    },
    { key: 'observaciones', label: 'Observaciones' },
  ];

  const generar = async () => {
    if (!sucursalId) {
      setNotification({ type: 'error', message: 'Seleccioná una sucursal' });
      return;
    }
    setLoading(true);
    try {
      const data = await reportesService.getPuestosRelevados({
        sucursalId: Number(sucursalId),
        fechaDesde,
        fechaHasta,
        includeFirmas: true,
      });
      setReporte(data);
      setNotification(null);
    } catch (e) {
      setNotification({ type: 'error', message: 'Error al generar el reporte' });
    } finally {
      setLoading(false);
    }
  };

  const exportarCsv = () => {
    if (!reporte) return;
    const header = ['Puesto', 'Datos del matafuego', 'Fecha', ...checklistKeys];
    const rows = (reporte.detalles || []).map((d) => [
      d.puesto ?? '',
      d.datosDelMatafuego ?? '',
      d.fecha ?? '',
      ...checklistKeys.map((k) => d.resultadosPorItem?.[k] ?? ''),
    ]);
    downloadCsv(`ReportePuestosRelevados_${fechaHasta}.csv`, [header, ...rows]);
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Puestos Relevados</h1>
          <p className="text-gray-600 dark:text-gray-400">Reporte de relevamientos de extintores por puesto</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sucursal</label>
            <select
              value={sucursalId}
              onChange={(e) => setSucursalId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Sucursal</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={generar}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar'}
          </button>
        </div>
      </div>

      {reporte && (
        <>
          {/* Resumen no conformes */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumen de No Conformes</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {reporte.noConforme.map((x) => (
                      <th key={x.checkListDetalleId} className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-left">
                        {x.item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {reporte.noConforme.map((x) => (
                      <td key={x.checkListDetalleId} className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        {x.cantidad}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Remitos */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <DataTable
              title="Remitos"
              data={reporte.remitos || []}
              columns={remitoColumns as any}
              itemsPerPage={10}
              emptyMessage="No hay remitos para el período seleccionado"
            />
          </div>

          {/* Detalle */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detalle de Relevamiento</h2>
              <button
                onClick={exportarCsv}
                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Exportar Excel (CSV)
              </button>
            </div>
            <DataTable
              data={detalleRows}
              columns={detalleColumns as any}
              itemsPerPage={20}
              emptyMessage="No hay detalles para el período seleccionado"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PuestosRelevadosReportPage;


