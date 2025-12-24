using Incer.Web.Api.DTOs.Reportes;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Enums;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportesController : BaseController
    {
        private readonly ApplicationDbContext _db;

        public ReportesController(
            ApplicationDbContext db,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _db = db;
        }

        [HttpGet("puestos-relevados")]
        public async Task<ActionResult<ReportePuestosRelevadosDto>> GetPuestosRelevados(
            [FromQuery] int sucursalId,
            [FromQuery] DateTime fechaDesde,
            [FromQuery] DateTime fechaHasta,
            [FromQuery] bool includeFirmas = false,
            [FromQuery] int? centerId = null)
        {
            if (sucursalId <= 0)
                return BadRequest(new { message = "Debe indicar sucursalId" });

            // Autorización (menu + backend): Reportes/Puestos Relevados
            if (!await _permissionService.CheckPermissionAsync("reportes.puestos-relevados", "read", centerId))
            {
                // fallback por permiso general
                if (!await _permissionService.CheckPermissionAsync("reportes", "read", centerId))
                    return Forbid();
            }

            var fechaHastaFinDia = new DateTime(fechaHasta.Year, fechaHasta.Month, fechaHasta.Day, 23, 59, 59, DateTimeKind.Utc);
            var fechaDesdeIniDia = new DateTime(fechaDesde.Year, fechaDesde.Month, fechaDesde.Day, 0, 0, 0, DateTimeKind.Utc);

            var detallesBaseQuery = _db.RelevamientoDetalles
                .Include(d => d.Puesto)
                .Include(d => d.DetalleResultados!)
                    .ThenInclude(r => r.CheckListDetalle)
                .Include(d => d.Relevamiento!)
                    .ThenInclude(r => r.Sucursal!)
                        .ThenInclude(s => s.Cliente)
                .Where(d =>
                    d.Relevamiento != null &&
                    d.Relevamiento.SucursalId == sucursalId &&
                    d.Relevamiento.TipoDeProductoId == (int)TipoDeProductoEnum.Extintores &&
                    d.Relevamiento.EstadoTareaId == (int)EstadoDeTarea.Finalizada &&
                    d.Relevamiento.Fecha >= fechaDesdeIniDia &&
                    d.Relevamiento.Fecha <= fechaHastaFinDia);

            IQueryable<Core.Entities.RelevamientoDetalle> detallesQuery;
            if (centerId.HasValue)
            {
                detallesQuery = detallesBaseQuery.Where(d => d.Relevamiento!.Sucursal!.Cliente!.BusinessCenterId == centerId.Value);
            }
            else
            {
                detallesQuery = await ApplyCenterFilterAsync(detallesBaseQuery, "Relevamiento.Sucursal.Cliente.BusinessCenterId");
            }

            var detalles = await detallesQuery.ToListAsync();

            // Checklist "ordenado" (por Orden) a partir de ids usados en el periodo
            var checkListDetalleIds = detalles
                .SelectMany(d => d.DetalleResultados ?? new List<Core.Entities.RelevamientoDetalleResultado>())
                .Select(r => r.CheckListDetalleId)
                .Distinct()
                .ToList();

            var checkListDetalles = await _db.CheckListDetalles
                .Where(x => checkListDetalleIds.Contains(x.Id))
                .Select(x => new { x.Id, x.Orden, x.Item })
                .OrderBy(x => x.Orden)
                .ToListAsync();

            var noConforme = checkListDetalles
                .Select(x => new ReporteNoConformeItemDto
                {
                    CheckListDetalleId = x.Id,
                    Orden = x.Orden,
                    Item = x.Item ?? string.Empty,
                    Cantidad = 0
                })
                .ToList();

            var noConformeById = noConforme.ToDictionary(x => x.CheckListDetalleId, x => x);

            foreach (var r in detalles.SelectMany(d => d.DetalleResultados ?? new List<Core.Entities.RelevamientoDetalleResultado>()))
            {
                if (!r.Conformidad && noConformeById.TryGetValue(r.CheckListDetalleId, out var item))
                    item.Cantidad++;
            }

            // Remitos vinculados a relevamientos del periodo (si los hay)
            var remitosBaseQuery = _db.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal!)
                    .ThenInclude(s => s.Cliente)
                .Where(r =>
                    r.SucursalId == sucursalId &&
                    _db.Relevamientos.Any(rel =>
                        rel.RemitoId == r.Id &&
                        rel.SucursalId == sucursalId &&
                        rel.TipoDeProductoId == (int)TipoDeProductoEnum.Extintores &&
                        rel.EstadoTareaId == (int)EstadoDeTarea.Finalizada &&
                        rel.Fecha >= fechaDesdeIniDia &&
                        rel.Fecha <= fechaHastaFinDia));

            IQueryable<Core.Entities.Remito> remitosQuery;
            if (centerId.HasValue)
            {
                remitosQuery = remitosBaseQuery.Where(r => r.Sucursal!.Cliente!.BusinessCenterId == centerId.Value);
            }
            else
            {
                remitosQuery = await ApplyCenterFilterAsync(remitosBaseQuery, "Sucursal.Cliente.BusinessCenterId");
            }

            var remitos = await remitosQuery
                .OrderBy(r => r.Fecha)
                .ToListAsync();

            // Extintores necesarios para "Datos del matafuego"
            var extintorIds = detalles.Select(d => d.ProductoId).Where(id => id > 0).Distinct().ToList();
            var extintores = await _db.Extintores
                .Include(e => e.TipoDeCarga)
                .Include(e => e.Capacidad)
                .Where(e => extintorIds.Contains(e.Id))
                .ToListAsync();
            var extById = extintores.ToDictionary(e => e.Id, e => e);

            var rows = detalles
                .OrderBy(d => d.Relevamiento!.Fecha)
                .Select(d =>
                {
                    var ext = extById.TryGetValue(d.ProductoId, out var e) ? e : null;
                    var datos = ext != null
                        ? $"{ext.NroSerie}-{ext.TipoDeCarga?.Nombre}".Trim('-')
                        : $"Elemento #{d.ProductoId}";

                    var resultados = new Dictionary<string, string?>();
                    foreach (var cd in checkListDetalles)
                    {
                        var res = d.DetalleResultados?.FirstOrDefault(x => x.CheckListDetalleId == cd.Id);
                        resultados[cd.Item ?? string.Empty] = FormatValorPuestos(res?.Valor);
                    }

                    return new ReportePuestosRelevadosRowDto
                    {
                        Puesto = d.Puesto?.Nombre,
                        DatosDelMatafuego = datos,
                        Fecha = d.Relevamiento!.Fecha,
                        ResultadosPorItem = resultados
                    };
                })
                .ToList();

            return Ok(new ReportePuestosRelevadosDto
            {
                FechaDesde = fechaDesdeIniDia,
                FechaHasta = fechaHastaFinDia,
                SucursalId = sucursalId,
                NoConforme = noConforme,
                Remitos = remitos.Select(r => new ReporteRemitoDto
                {
                    Id = r.Id,
                    Fecha = r.Fecha,
                    ChoferNombre = r.Chofer != null ? $"{r.Chofer.Apellido}, {r.Chofer.Nombre}".Trim(' ', ',') : "",
                    ClienteNombre = r.Sucursal?.Cliente?.Nombre ?? "",
                    Observaciones = r.Descripcion,
                    FirmaOperadorBase64 = includeFirmas && r.FirmaOperador != null ? Convert.ToBase64String(r.FirmaOperador) : null,
                    FirmaEncargadoBase64 = includeFirmas && r.FirmaEncargado != null ? Convert.ToBase64String(r.FirmaEncargado) : null,
                }).ToList(),
                Detalles = rows
            });
        }

        [HttpGet("elementos-relevados")]
        public async Task<ActionResult<ReporteElementosRelevadosDto>> GetElementosRelevados(
            [FromQuery] int sucursalId,
            [FromQuery] int tipoDeElementoId,
            [FromQuery] DateTime fechaDesde,
            [FromQuery] DateTime fechaHasta,
            [FromQuery] bool includeFirmas = false,
            [FromQuery] int? centerId = null)
        {
            if (sucursalId <= 0)
                return BadRequest(new { message = "Debe indicar sucursalId" });
            if (tipoDeElementoId <= 0)
                return BadRequest(new { message = "Debe indicar tipoDeElementoId" });

            // Autorización (menu + backend): Reportes/Elementos Relevados
            if (!await _permissionService.CheckPermissionAsync("reportes.elementos-relevados", "read", centerId))
            {
                // fallback por permiso general
                if (!await _permissionService.CheckPermissionAsync("reportes", "read", centerId))
                    return Forbid();
            }

            var fechaHastaFinDia = new DateTime(fechaHasta.Year, fechaHasta.Month, fechaHasta.Day, 23, 59, 59, DateTimeKind.Utc);
            var fechaDesdeIniDia = new DateTime(fechaDesde.Year, fechaDesde.Month, fechaDesde.Day, 0, 0, 0, DateTimeKind.Utc);

            var detallesBaseQuery = _db.RelevamientoDetalles
                .Include(d => d.DetalleResultados!)
                    .ThenInclude(r => r.CheckListDetalle)
                .Include(d => d.Relevamiento!)
                    .ThenInclude(r => r.Sucursal!)
                        .ThenInclude(s => s.Cliente)
                .Where(d =>
                    d.Relevamiento != null &&
                    d.Relevamiento.SucursalId == sucursalId &&
                    d.Relevamiento.TipoDeProductoId == (int)TipoDeProductoEnum.InstalacionesFijas &&
                    d.Relevamiento.TipoDeElementoId == tipoDeElementoId &&
                    d.Relevamiento.EstadoTareaId == (int)EstadoDeTarea.Finalizada &&
                    d.Relevamiento.Fecha >= fechaDesdeIniDia &&
                    d.Relevamiento.Fecha <= fechaHastaFinDia);

            IQueryable<Core.Entities.RelevamientoDetalle> detallesQuery;
            if (centerId.HasValue)
            {
                detallesQuery = detallesBaseQuery.Where(d => d.Relevamiento!.Sucursal!.Cliente!.BusinessCenterId == centerId.Value);
            }
            else
            {
                detallesQuery = await ApplyCenterFilterAsync(detallesBaseQuery, "Relevamiento.Sucursal.Cliente.BusinessCenterId");
            }

            var detalles = await detallesQuery.ToListAsync();

            var checkListDetalleIds = detalles
                .SelectMany(d => d.DetalleResultados ?? new List<Core.Entities.RelevamientoDetalleResultado>())
                .Select(r => r.CheckListDetalleId)
                .Distinct()
                .ToList();

            var checkListDetalles = await _db.CheckListDetalles
                .Where(x => checkListDetalleIds.Contains(x.Id))
                .Select(x => new { x.Id, x.Orden, x.Item })
                .OrderBy(x => x.Orden)
                .ToListAsync();

            var noConforme = checkListDetalles
                .Select(x => new ReporteNoConformeItemDto
                {
                    CheckListDetalleId = x.Id,
                    Orden = x.Orden,
                    Item = x.Item ?? string.Empty,
                    Cantidad = 0
                })
                .ToList();

            var noConformeById = noConforme.ToDictionary(x => x.CheckListDetalleId, x => x);

            foreach (var r in detalles.SelectMany(d => d.DetalleResultados ?? new List<Core.Entities.RelevamientoDetalleResultado>()))
            {
                if (!r.Conformidad && noConformeById.TryGetValue(r.CheckListDetalleId, out var item))
                    item.Cantidad++;
            }

            var remitosBaseQuery = _db.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal!)
                    .ThenInclude(s => s.Cliente)
                .Where(r =>
                    r.SucursalId == sucursalId &&
                    _db.Relevamientos.Any(rel =>
                        rel.RemitoId == r.Id &&
                        rel.SucursalId == sucursalId &&
                        rel.TipoDeProductoId == (int)TipoDeProductoEnum.InstalacionesFijas &&
                        rel.TipoDeElementoId == tipoDeElementoId &&
                        rel.EstadoTareaId == (int)EstadoDeTarea.Finalizada &&
                        rel.Fecha >= fechaDesdeIniDia &&
                        rel.Fecha <= fechaHastaFinDia));

            IQueryable<Core.Entities.Remito> remitosQuery;
            if (centerId.HasValue)
            {
                remitosQuery = remitosBaseQuery.Where(r => r.Sucursal!.Cliente!.BusinessCenterId == centerId.Value);
            }
            else
            {
                remitosQuery = await ApplyCenterFilterAsync(remitosBaseQuery, "Sucursal.Cliente.BusinessCenterId");
            }

            var remitos = await remitosQuery
                .OrderBy(r => r.Fecha)
                .ToListAsync();

            // Elementos necesarios para "Datos del elemento"
            var elementoIds = detalles.Select(d => d.ProductoId).Where(id => id > 0).Distinct().ToList();
            var elementos = await _db.Elementos
                .Include(e => e.TipoDeElemento)
                .Where(e => elementoIds.Contains(e.Id))
                .ToListAsync();
            var elById = elementos.ToDictionary(e => e.Id, e => e);

            var rows = detalles
                .OrderBy(d => d.Relevamiento!.Fecha)
                .Select(d =>
                {
                    var el = elById.TryGetValue(d.ProductoId, out var e) ? e : null;
                    var datos = el != null
                        ? $"{el.TipoDeElemento?.Nombre} - {el.Codigo}".Trim(' ', '-')
                        : $"Elemento #{d.ProductoId}";

                    var resultados = new Dictionary<string, string?>();
                    foreach (var cd in checkListDetalles)
                    {
                        var res = d.DetalleResultados?.FirstOrDefault(x => x.CheckListDetalleId == cd.Id);
                        resultados[cd.Item ?? string.Empty] = FormatValorElementos(res?.Valor);
                    }

                    return new ReporteElementosRelevadosRowDto
                    {
                        Fecha = d.Relevamiento!.Fecha,
                        DatosDelElemento = datos,
                        Interno = el?.Interno,
                        Ubicacion = el?.Ubicacion,
                        ResultadosPorItem = resultados
                    };
                })
                .ToList();

            return Ok(new ReporteElementosRelevadosDto
            {
                FechaDesde = fechaDesdeIniDia,
                FechaHasta = fechaHastaFinDia,
                SucursalId = sucursalId,
                TipoDeElementoId = tipoDeElementoId,
                NoConforme = noConforme,
                Remitos = remitos.Select(r => new ReporteRemitoDto
                {
                    Id = r.Id,
                    Fecha = r.Fecha,
                    ChoferNombre = r.Chofer != null ? $"{r.Chofer.Apellido}, {r.Chofer.Nombre}".Trim(' ', ',') : "",
                    ClienteNombre = r.Sucursal?.Cliente?.Nombre ?? "",
                    Observaciones = r.Descripcion,
                    FirmaOperadorBase64 = includeFirmas && r.FirmaOperador != null ? Convert.ToBase64String(r.FirmaOperador) : null,
                    FirmaEncargadoBase64 = includeFirmas && r.FirmaEncargado != null ? Convert.ToBase64String(r.FirmaEncargado) : null,
                }).ToList(),
                Detalles = rows
            });
        }

        private static string? FormatValorPuestos(string? valor)
        {
            if (valor == null) return null;
            var v = valor.Trim().ToLowerInvariant();
            if (v == "true") return "OK";
            if (v == "false") return "NO";
            if (DateTime.TryParse(valor, out var dt)) return dt.ToString("dd/MM/yyyy");
            return valor;
        }

        private static string? FormatValorElementos(string? valor)
        {
            if (valor == null) return null;
            var v = valor.Trim().ToLowerInvariant();
            if (v == "true") return "CUMPLE";
            if (v == "false") return "NO CUMPLE";
            if (DateTime.TryParse(valor, out var dt)) return dt.ToString("dd/MM/yyyy");
            return valor;
        }
    }
}


