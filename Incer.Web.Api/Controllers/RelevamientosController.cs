using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;
using Incer.Web.Api.DTOs;
using Incer.Web.Core.Enums;
using System.Text.Json;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RelevamientosController : BaseController
    {
        private readonly IRelevamientoRepository _relevamientoRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ApplicationDbContext _context;

        public RelevamientosController(IRelevamientoRepository relevamientoRepository, IUnitOfWork unitOfWork, ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _relevamientoRepository = relevamientoRepository;
            _unitOfWork = unitOfWork;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Relevamiento>>> GetRelevamientos([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET RELEVAMIENTOS ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _relevamientoRepository.GetQueryable()
                    .Include(r => r.Sucursal)
                        .ThenInclude(s => s.Cliente)
                    .Include(r => r.EstadoTarea)
                    .Include(r => r.Usuario)
                    .Include(r => r.TipoDeProducto)
                    .Include(r => r.TipoDeElemento)
                    .OrderByDescending(r => r.Id)
                    .Take(10); // Limitar a los últimos 10 relevamientos

                IQueryable<Relevamiento> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(r => r.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "Sucursal.Cliente.BusinessCenterId");
                }

                var relevamientos = await query.ToListAsync();
                Console.WriteLine($"Relevamientos encontrados: {relevamientos.Count}");
                Console.WriteLine($"=========================");

                return Ok(relevamientos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetRelevamientos: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Relevamiento>> GetRelevamiento(int id)
        {
            Console.WriteLine($"=== CARGANDO RELEVAMIENTO {id} ===");
            
            // Primero verificar si el relevamiento existe sin filtros
            var relevamientoExists = await _relevamientoRepository.GetQueryable()
                .AnyAsync(r => r.Id == id);
                
            Console.WriteLine($"Relevamiento {id} existe en BD: {relevamientoExists}");
            
            // Verificar si existen detalles en BD para este relevamiento
            var detallesCount = await _relevamientoRepository.GetQueryable()
                .Where(r => r.Id == id)
                .SelectMany(r => r.RelevamientoDetalles)
                .CountAsync();
            Console.WriteLine($"Detalles en BD para relevamiento {id}: {detallesCount}");
            
            if (!relevamientoExists)
            {
                Console.WriteLine($"Relevamiento {id} NO encontrado en BD");
                return NotFound();
            }
            
            // Aplicar filtro de centros solo si es necesario
            var query = _relevamientoRepository.GetQueryable()
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s.Cliente)
                        .ThenInclude(c => c.BusinessCenter)
                .Include(r => r.EstadoTarea)
                .Include(r => r.Usuario)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.TipoDeElemento)
                .Include(r => r.CheckList)
                .Include(r => r.RelevamientoDetalles)
                    .ThenInclude(rd => rd.DetalleResultados)
                        .ThenInclude(dr => dr.CheckListDetalle)
                .Include(r => r.RelevamientoDetalles)
                    .ThenInclude(rd => rd.DetalleFotos)
                .Include(r => r.RelevamientoDetalles)
                    .ThenInclude(rd => rd.Puesto)
                .Include(r => r.RelevamientoDetalles)
                    .ThenInclude(rd => rd.Archivo)
                .Where(r => r.Id == id);
            
            // Aplicar filtro de centros
            var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
            
            Console.WriteLine($"Query después del filtro de centros: {filteredQuery.Count()} relevamientos");
            
            var relevamiento = await filteredQuery.FirstOrDefaultAsync();
                
            if (relevamiento == null)
            {
                Console.WriteLine($"Relevamiento {id} NO encontrado");
                return NotFound();
            }
            
            Console.WriteLine($"Relevamiento {id} encontrado:");
            Console.WriteLine($"  - ID: {relevamiento.Id}");
            Console.WriteLine($"  - Fecha: {relevamiento.Fecha}");
            Console.WriteLine($"  - Sucursal: {relevamiento.Sucursal?.Nombre}");
            Console.WriteLine($"  - Cliente: {relevamiento.Sucursal?.Cliente?.Nombre}");
            
            // Log para debuggear
            Console.WriteLine($"Relevamiento {id} cargado con {relevamiento.RelevamientoDetalles?.Count ?? 0} detalles");
            
            if (relevamiento.RelevamientoDetalles != null && relevamiento.RelevamientoDetalles.Any())
            {
                Console.WriteLine("Detalles encontrados:");
                foreach (var detalle in relevamiento.RelevamientoDetalles)
                {
                    Console.WriteLine($"  - Detalle ID: {detalle.Id}, ProductoId: {detalle.ProductoId}");
                }
            }
            else
            {
                Console.WriteLine("NO se encontraron detalles para este relevamiento");
            }
            
            // Obtener información real de extintores desde la base de datos
            var extintoresIds = relevamiento.RelevamientoDetalles?.Select(rd => rd.ProductoId).ToList() ?? new List<int>();
            var extintores = new Dictionary<int, Extintor>();
            
            if (extintoresIds.Any())
            {
                var extintoresFromDb = await _context.Extintores
                    .Include(e => e.TipoDeCarga) // Incluir TipoDeCarga para obtener el nombre
                    .Where(e => extintoresIds.Contains(e.Id))
                    .ToListAsync();
                    
                extintores = extintoresFromDb.ToDictionary(e => e.Id, e => e);
                
                Console.WriteLine($"=== EXTINTORES ENCONTRADOS ===");
                Console.WriteLine($"IDs buscados: {string.Join(", ", extintoresIds)}");
                Console.WriteLine($"Extintores encontrados: {extintoresFromDb.Count}");
                foreach (var ext in extintoresFromDb)
                {
                    Console.WriteLine($"  - ID: {ext.Id}, Serie: {ext.NroSerie}, TipoCarga: {ext.TipoDeCarga?.Nombre}, Ubicación: {ext.Ubicacion}, Reserva: {ext.Reserva}");
                }
                
                // Verificar si hay IDs que no se encontraron
                var idsNoEncontrados = extintoresIds.Where(id => !extintoresFromDb.Any(e => e.Id == id)).ToList();
                if (idsNoEncontrados.Any())
                {
                    Console.WriteLine($"IDs NO ENCONTRADOS: {string.Join(", ", idsNoEncontrados)}");
                }
            }

            // Crear DTO simple para evitar referencias circulares
            var relevamientoDto = new
            {
                Id = relevamiento.Id,
                Fecha = relevamiento.Fecha,
                FechaFin = relevamiento.FechaFin,
                FechaRecepcion = relevamiento.FechaRecepcion,
                Descripcion = relevamiento.Descripcion,
                Leyenda = relevamiento.Leyenda,
                SucursalId = relevamiento.SucursalId,
                EstadoTareaId = relevamiento.EstadoTareaId,
                UsuarioId = relevamiento.UsuarioId,
                TipoDeProductoId = relevamiento.TipoDeProductoId,
                TipoDeElementoId = relevamiento.TipoDeElementoId,
                CheckListId = relevamiento.CheckListId,
                TareaId = relevamiento.TareaId,
                // Información básica de relaciones sin navegación
                SucursalNombre = relevamiento.Sucursal?.Nombre,
                ClienteNombre = relevamiento.Sucursal?.Cliente?.Nombre,
                EstadoTareaNombre = relevamiento.EstadoTarea?.Nombre,
                UsuarioNombre = relevamiento.Usuario?.Nombre,
                UsuarioApellido = relevamiento.Usuario?.Apellido,
                TipoDeProductoNombre = relevamiento.TipoDeProducto?.Nombre,
                TipoDeElementoNombre = relevamiento.TipoDeElemento?.Nombre,
                // Detalles simplificados
                RelevamientoDetalles = relevamiento.RelevamientoDetalles?.Select(rd => 
                {
                    var extintor = extintores.ContainsKey(rd.ProductoId) ? extintores[rd.ProductoId] : null;
                    
                    var productoUbicacion = rd.Puesto?.Ubicacion; // Ubicación del puesto
                    
                    Console.WriteLine($"=== MAPEANDO DETALLE ID: {rd.Id} ===");
                    Console.WriteLine($"PuestoNombre: {rd.Puesto?.Nombre}");
                    Console.WriteLine($"PuestoUbicacion: {rd.Puesto?.Ubicacion}");
                    Console.WriteLine($"PuestoCompleto: {(rd.Puesto != null ? $"{rd.Puesto.Nombre}-{rd.Puesto.Ubicacion}" : null)}");
                    Console.WriteLine($"ProductoSerieSolo: {extintor?.NroSerie}");
                    Console.WriteLine($"Extintor encontrado: {extintor != null}");
                    
                    return new
                    {
                        Id = rd.Id,
                        ProductoId = rd.ProductoId,
                        Observaciones = rd.Observaciones,
                        Latitud = rd.Latitud,
                        Longitud = rd.Longitud,
                        PuestoId = rd.PuestoId,
                        ArchivoId = rd.ArchivoId,
                        PuestoNombre = rd.Puesto?.Nombre,
                        PuestoUbicacion = rd.Puesto?.Ubicacion,
                        PuestoCompleto = rd.Puesto != null ? $"{rd.Puesto.Nombre}-{rd.Puesto.Ubicacion}" : null,
                        ArchivoNombre = rd.Archivo?.Nombre,
                        // Información real del extintor desde la base de datos
                        ProductoNombre = extintor != null ? $"Extintor #{extintor.Id}" : $"Elemento #{rd.ProductoId}",
                        ProductoSerie = extintor != null ? $"{extintor.NroSerie}-{extintor.TipoDeCarga?.Nombre}" : null,
                        ProductoSerieSolo = extintor?.NroSerie, // Solo número de serie para el modal
                        ProductoUbicacion = productoUbicacion, // Ubicación del puesto desde tabla Puesto
                        ProductoReserva = extintor?.Reserva ?? false,
                        ProductoVencimientoCarga = extintor?.VencimientoCarga,
                        ProductoVencimientoPH = extintor?.VencimientoPH,
                        // Resultados simplificados
                        DetalleResultados = rd.DetalleResultados?.Select(dr => new
                        {
                            Id = dr.Id,
                            Conformidad = dr.Conformidad,
                            Observaciones = dr.Observaciones,
                            Valor = dr.Valor,
                            Urgencia = dr.Urgencia,
                            CheckListDetalleId = dr.CheckListDetalleId,
                            CheckListDetalleTitulo = dr.CheckListDetalle?.Titulo,
                            CheckListDetalleItem = dr.CheckListDetalle?.Item
                        }),
                        // Fotos simplificadas
                        DetalleFotos = rd.DetalleFotos?.Select(df => new
                        {
                            Id = df.Id,
                            ArchivoId = df.ArchivoId,
                            ArchivoNombre = df.Archivo?.Nombre
                        })
                    };
                })
            };
            
            return Ok(relevamientoDto);
        }

        [HttpGet("tarea/{tareaId}")]
        public async Task<ActionResult<IEnumerable<Relevamiento>>> GetRelevamientosByTarea(int tareaId)
        {
            var query = _relevamientoRepository.GetQueryable()
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s.Cliente)
                        .ThenInclude(c => c.BusinessCenter)
                .Include(r => r.EstadoTarea)
                .Include(r => r.Usuario)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.TipoDeElemento)
                .Include(r => r.CheckList)
                .Where(r => r.TareaId == tareaId);
            
            var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
            var relevamientos = await filteredQuery.ToListAsync();
            return Ok(relevamientos);
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Relevamiento>>> GetRelevamientosByUsuario(int usuarioId)
        {
            var query = _relevamientoRepository.GetQueryable()
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s.Cliente)
                        .ThenInclude(c => c.BusinessCenter)
                .Include(r => r.EstadoTarea)
                .Include(r => r.Usuario)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.TipoDeElemento)
                .Include(r => r.CheckList)
                .Where(r => r.UsuarioId == usuarioId);
            
            var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
            var relevamientos = await filteredQuery.ToListAsync();
            return Ok(relevamientos);
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<Relevamiento>>> GetRelevamientosBySucursal(int sucursalId)
        {
            var query = _relevamientoRepository.GetQueryable()
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s.Cliente)
                        .ThenInclude(c => c.BusinessCenter)
                .Include(r => r.EstadoTarea)
                .Include(r => r.Usuario)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.TipoDeElemento)
                .Include(r => r.CheckList)
                .Where(r => r.SucursalId == sucursalId);
            
            var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
            var relevamientos = await filteredQuery.ToListAsync();
            return Ok(relevamientos);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Relevamiento>>> SearchRelevamientos(
            [FromQuery] string? cliente = null,
            [FromQuery] string? sucursal = null,
            [FromQuery] string? tipoProducto = null,
            [FromQuery] int? estadoTareaId = null,
            [FromQuery] int? usuarioId = null,
            [FromQuery] DateTime? fechaDesde = null,
            [FromQuery] DateTime? fechaHasta = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            Console.WriteLine($"=== BÚSQUEDA DE RELEVAMIENTOS ===");
            Console.WriteLine($"Cliente: {cliente}");
            Console.WriteLine($"Sucursal: {sucursal}");
            Console.WriteLine($"TipoProducto: {tipoProducto}");
            Console.WriteLine($"EstadoTareaId: {estadoTareaId}");
            Console.WriteLine($"UsuarioId: {usuarioId}");
            Console.WriteLine($"FechaDesde: {fechaDesde}");
            Console.WriteLine($"FechaHasta: {fechaHasta}");
            Console.WriteLine($"Page: {page}");
            Console.WriteLine($"PageSize: {pageSize}");

            var query = _relevamientoRepository.GetQueryable()
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s.Cliente)
                .Include(r => r.EstadoTarea)
                .Include(r => r.Usuario)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.TipoDeElemento)
                .AsQueryable();

            Console.WriteLine($"Query inicial: {query.Count()} relevamientos");

            // Aplicar filtros
            if (!string.IsNullOrEmpty(cliente))
            {
                query = query.Where(r => r.Sucursal.Cliente.Nombre.Contains(cliente));
                Console.WriteLine($"Después de filtrar por cliente '{cliente}': {query.Count()} relevamientos");
            }
            
            if (!string.IsNullOrEmpty(sucursal))
            {
                query = query.Where(r => r.Sucursal.Nombre.Contains(sucursal));
                Console.WriteLine($"Después de filtrar por sucursal '{sucursal}': {query.Count()} relevamientos");
            }
            
            if (!string.IsNullOrEmpty(tipoProducto))
            {
                query = query.Where(r => r.TipoDeProducto.Nombre.Contains(tipoProducto));
                Console.WriteLine($"Después de filtrar por tipoProducto '{tipoProducto}': {query.Count()} relevamientos");
            }
            
            if (estadoTareaId.HasValue)
            {
                query = query.Where(r => r.EstadoTareaId == estadoTareaId.Value);
                Console.WriteLine($"Después de filtrar por estadoTareaId {estadoTareaId}: {query.Count()} relevamientos");
            }
            
            if (usuarioId.HasValue)
            {
                query = query.Where(r => r.UsuarioId == usuarioId.Value);
                Console.WriteLine($"Después de filtrar por usuarioId {usuarioId}: {query.Count()} relevamientos");
            }
            
            if (fechaDesde.HasValue)
            {
                query = query.Where(r => r.Fecha >= fechaDesde.Value);
                Console.WriteLine($"Después de filtrar por fechaDesde {fechaDesde}: {query.Count()} relevamientos");
            }
            
            if (fechaHasta.HasValue)
            {
                query = query.Where(r => r.Fecha <= fechaHasta.Value);
                Console.WriteLine($"Después de filtrar por fechaHasta {fechaHasta}: {query.Count()} relevamientos");
            }

            // Aplicar filtro de centros y paginación
            var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
            var totalCount = await filteredQuery.CountAsync();
            
            Console.WriteLine($"Después de aplicar filtro de centros: {totalCount} relevamientos");
            
            var relevamientos = await filteredQuery
                .OrderByDescending(r => r.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Console.WriteLine($"Relevamientos finales devueltos: {relevamientos.Count}");

            return Ok(new { 
                data = relevamientos, 
                total = totalCount, 
                page = page, 
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpGet("filters")]
        public async Task<ActionResult<object>> GetFilterOptions()
        {
            try
            {
                var query = _relevamientoRepository.GetQueryable()
                    .Include(r => r.Sucursal)
                        .ThenInclude(s => s.Cliente)
                    .Include(r => r.EstadoTarea)
                    .Include(r => r.TipoDeProducto)
                    .AsQueryable();

                var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");

                var clientes = await filteredQuery
                    .Select(r => r.Sucursal.Cliente.Nombre)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();

                var sucursales = await filteredQuery
                    .Select(r => new { 
                        Nombre = r.Sucursal.Nombre, 
                        ClienteNombre = r.Sucursal.Cliente.Nombre 
                    })
                    .Distinct()
                    .OrderBy(s => s.Nombre)
                    .ToListAsync();

                var estados = await filteredQuery
                    .Select(r => new { 
                        Id = r.EstadoTarea.Id, 
                        Nombre = r.EstadoTarea.Nombre 
                    })
                    .Distinct()
                    .OrderBy(e => e.Nombre)
                    .ToListAsync();

                var tiposProducto = await filteredQuery
                    .Select(r => r.TipoDeProducto.Nombre)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToListAsync();

                return Ok(new {
                    clientes = clientes.Select(c => new { value = c, label = c }),
                    sucursales = sucursales.Select(s => new { 
                        value = s.Nombre, 
                        label = s.Nombre, 
                        cliente = s.ClienteNombre 
                    }),
                    estados = estados.Select(e => new { value = e.Id, label = e.Nombre }),
                    tiposProducto = tiposProducto.Select(t => new { value = t, label = t })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("pendientes")]
        public async Task<ActionResult<IEnumerable<RelevamientoPendiente>>> GetRelevamientosPendientes([FromQuery] int? days = null)
        {
            try
            {
                // Obtener el usuario actual del contexto
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    return Unauthorized(new { message = "Usuario no autenticado" });
                }

                // Si days no se especifica o es 0, usar 1 por defecto
                var daysValue = days ?? 1;
                if (daysValue == 0)
                    daysValue = 1;

                // Fecha de inicio: inicio del día actual
                var start = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
                // Fecha de fin: ahora + días especificados
                var end = DateTime.Now.AddDays(daysValue);

                Console.WriteLine($"=== GET RELEVAMIENTOS PENDIENTES ===");
                Console.WriteLine($"UsuarioId: {userId.Value}, Days: {daysValue}, Start: {start}, End: {end}");

                // Usar el enum directamente
                var estadoAsignadaId = (int)EstadoDeTarea.Asignada;
                var estadoFinalizadaId = (int)EstadoDeTarea.Finalizada;

                Console.WriteLine($"Estado Asignada ID: {estadoAsignadaId}, Estado Finalizada ID: {estadoFinalizadaId}");

                // Obtener relevamientos pendientes (asignados al usuario, estado Asignada, dentro del rango de fechas)
                var relevamientosQuery = _relevamientoRepository.GetQueryable()
                    .Where(x => x.EstadoTareaId == estadoAsignadaId &&
                                x.UsuarioId == userId.Value &&
                                x.Fecha >= start &&
                                x.Fecha <= end);

                // Aplicar filtro de centros
                var filteredQuery = await ApplyCenterFilterAsync(relevamientosQuery, "Sucursal.Cliente.BusinessCenterId");

                var relevamientos = await filteredQuery
                    .Select(x => new RelevamientoPendiente
                    {
                        Id = x.Id,
                        Descripcion = x.Descripcion,
                        Fecha = x.Fecha,
                        UsuarioId = x.UsuarioId,
                        Activo = x.Activo,
                        SucursalId = x.SucursalId,
                        CheckListId = x.CheckListId,
                        EstadoTareaId = x.EstadoTareaId,
                        TipoDeProductoId = x.TipoDeProductoId,
                        FechaFin = x.FechaFin,
                        TareaId = x.TareaId,
                        RemitoId = x.RemitoId,
                        TipoDeElementoId = x.TipoDeElementoId,
                        FechaUltimoRelevamiento = _context.Relevamientos
                            .Where(y => y.SucursalId == x.SucursalId &&
                                   y.EstadoTareaId == estadoFinalizadaId)
                            .Max(y => (DateTime?)y.FechaFin)
                    })
                    .ToListAsync();

                Console.WriteLine($"Relevamientos pendientes encontrados: {relevamientos.Count}");
                Console.WriteLine($"=====================================");

                return Ok(relevamientos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetRelevamientosPendientes: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost]
        [ProducesResponseType(400)]
        [ProducesResponseType(201)]
        public async Task<ActionResult<RelevamientoPendiente>> CreateRelevamiento(Relevamiento relevamiento)
        {
            try
            {
                // 1. Establecer FechaRecepcion
                relevamiento.FechaRecepcion = DateTime.Now;
                
                // 2. Agregar relevamiento
                _context.Set<Relevamiento>().Add(relevamiento);
                
                // 3. Si FechaFin es null, establecer a Fecha + 2 horas
                if (relevamiento.FechaFin == null)
                    relevamiento.FechaFin = relevamiento.Fecha.AddHours(2);
                
                // 4. Validar remito si el estado es Finalizada
                var estadoFinalizadaId = (int)EstadoDeTarea.Finalizada;
                
                if (relevamiento.EstadoTareaId == estadoFinalizadaId)
                {
                    if (relevamiento.RemitoId == null)
                        return BadRequest(new { message = "Debe asignar un remito al relevamiento." });
                    
                    var remito = await _context.Remitos.FindAsync(relevamiento.RemitoId);
                    if (remito == null)
                        return NotFound(new { message = "Remito no encontrado." });
                    
                    if (remito.SucursalId != relevamiento.SucursalId)
                        return BadRequest(new { message = "La sucursal del remito asignado no coincide con la sucursal del relevamiento." });
                }
                
                // 5. Guardar cambios
                await _context.SaveChangesAsync();
                
                // 6. Crear historial inicial para el relevamiento
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "Usuario no autenticado" });
                
                TareaEstadoHistoria estadoHistoria = new TareaEstadoHistoria
                {
                    TareaId = relevamiento.TareaId,
                    EstadoTareaId = relevamiento.EstadoTareaId,
                    Fecha = DateTime.Now,
                    UsuarioId = userId.Value,
                    Descripcion = null,
                    RelevamientoId = relevamiento.Id,
                    FechaEstablecida = relevamiento.Fecha,
                    UsuarioIdEstablecido = relevamiento.UsuarioId
                };
                _context.Set<TareaEstadoHistoria>().Add(estadoHistoria);
                
                await _context.SaveChangesAsync();
                
                // 7. Limpiar relación Remito para el response
                relevamiento.Remito = null;
                
                // 8. Crear RelevamientoPendiente
                var relevamientoPen = new RelevamientoPendiente(relevamiento);
                
                // 9. Calcular FechaUltimoRelevamiento
                relevamientoPen.FechaUltimoRelevamiento = await _context.Relevamientos
                    .Where(y => y.SucursalId == relevamientoPen.SucursalId &&
                           y.EstadoTareaId == estadoFinalizadaId)
                    .MaxAsync(y => (DateTime?)y.FechaFin);
                
                return CreatedAtAction("GetRelevamiento", new { id = relevamiento.Id }, relevamientoPen);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en CreateRelevamiento: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("{id}/detalles")]
        [ProducesResponseType(400)]
        [ProducesResponseType(201)]
        public async Task<ActionResult<object>> FinalizarRelevamientoDetalles(int id, [FromBody] FinalizarRelevamientoDetallesRequest request)
        {
            try
            {
                // Cargar relevamiento y validar acceso por centros
                var query = _context.Relevamientos
                    .Include(r => r.Sucursal)
                        .ThenInclude(s => s.Cliente)
                    .Where(r => r.Id == id);

                var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
                var relevamiento = await filteredQuery.FirstOrDefaultAsync();

                if (relevamiento == null)
                    return NotFound(new { message = "El relevamiento indicado es incorrecto o no tiene acceso." });

                if (relevamiento.EstadoTareaId == (int)EstadoDeTarea.Finalizada)
                    return BadRequest(new { message = "No se puede modificar una tarea finalizada." });

                // Defaults de fechas (manteniendo compatibilidad con el comportamiento del API viejo)
                var fecha = request.Fecha ?? DateTime.UtcNow.AddHours(-2);
                var fechaFin = request.FechaFin ?? DateTime.UtcNow;

                // Validación de remito
                if (relevamiento.RemitoId == null && request.RemitoId == null)
                    return BadRequest(new { message = "El relevamiento no posee un remito asignado." });

                if (relevamiento.RemitoId == null && request.RemitoId != null)
                {
                    var remito = await _context.Remitos.FindAsync(request.RemitoId);
                    if (remito == null)
                        return NotFound(new { message = "Remito no encontrado." });

                    if (remito.SucursalId != relevamiento.SucursalId)
                        return BadRequest(new { message = "La sucursal del remito asignado no coincide con la sucursal del relevamiento." });

                    relevamiento.RemitoId = request.RemitoId;
                }

                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "Usuario no autenticado" });

                // Crea historia de estado y actualiza relevamiento
                _context.TareasEstadosHistoria.Add(new TareaEstadoHistoria
                {
                    TareaId = relevamiento.TareaId,
                    RelevamientoId = relevamiento.Id,
                    EstadoTareaId = (int)EstadoDeTarea.Finalizada,
                    Fecha = DateTime.UtcNow,
                    UsuarioId = userId.Value,
                    UsuarioIdEstablecido = userId.Value,
                    FechaEstablecida = fecha,
                    Descripcion = ""
                });

                relevamiento.EstadoTareaId = (int)EstadoDeTarea.Finalizada;
                relevamiento.Fecha = fecha;
                relevamiento.FechaFin = fechaFin;
                relevamiento.UsuarioId = userId.Value;
                _context.Relevamientos.Update(relevamiento);

                // Pre-cargar ids de detalles de tipo de elemento para instalaciones fijas (si aplica)
                List<int> tipoElementosDbIds = new();
                if (relevamiento.TipoDeProductoId == (int)TipoDeProductoEnum.InstalacionesFijas && relevamiento.TipoDeElementoId.HasValue)
                {
                    tipoElementosDbIds = await _context.TiposElementoDetalle
                        .Where(x => x.TipoElementoId == relevamiento.TipoDeElementoId.Value)
                        .Select(x => x.Id)
                        .ToListAsync();
                }

                var checklistDetallesId = await _context.CheckListDetalles
                    .Where(x => x.CheckListId == relevamiento.CheckListId)
                    .Select(x => x.Id)
                    .ToListAsync();

                // Procesar detalles
                var detallesReq = (request.Detalles != null && request.Detalles.Any())
                    ? request.Detalles
                    : (request.RelevamientoDetalles ?? new List<RelevamientoDetalleRequest>());

                if (detallesReq == null || detallesReq.Count == 0)
                    return BadRequest(new { message = "Debe enviar detalles para finalizar el relevamiento." });

                // Track de ids temporales (para compat con ids negativos)
                var tempIdToRealProductoId = new Dictionary<int, int>();

                foreach (var detalleReq in detallesReq)
                {
                    var relevamientoDetalle = new RelevamientoDetalle
                    {
                        RelevamientoId = relevamiento.Id,
                        Latitud = detalleReq.Latitud ?? 0,
                        Longitud = detalleReq.Longitud ?? 0,
                        Observaciones = detalleReq.Observaciones,
                        ProductoId = detalleReq.ProductoId,
                        PuestoId = detalleReq.PuestoId,
                        ArchivoId = detalleReq.ArchivoId,
                        Archivo = detalleReq.Archivo != null
                            ? new Archivo
                            {
                                Nombre = detalleReq.Archivo.Nombre,
                                Fecha = detalleReq.Archivo.Fecha ?? DateTime.UtcNow,
                                Contenido = detalleReq.Archivo.Contenido
                            }
                            : null,
                    };

                    relevamientoDetalle.RelevamientoId = relevamiento.Id;
                    relevamientoDetalle.Relevamiento = null; // evitar tracking accidental del objeto de request

                    // Validar checklist completo
                    var resultadosReq = (detalleReq.DetalleResultados != null && detalleReq.DetalleResultados.Any())
                        ? detalleReq.DetalleResultados
                        : (detalleReq.RelevamientoDetalleResultados ?? new List<RelevamientoDetalleResultadoRequest>());

                    var checkLDetIdRDetalle = resultadosReq
                        .Select(x => x.CheckListDetalleId)
                        .Where(x => x.HasValue)
                        .Select(x => x!.Value)
                        .ToList();

                    var diffs = checklistDetallesId.Except(checkLDetIdRDetalle).ToList();
                    if (diffs.Count > 0)
                        return BadRequest(new { message = "Debe completar todos los items del checklist." });

                    // Validar archivo (si existe)
                    if (relevamientoDetalle.Archivo != null && string.IsNullOrEmpty(relevamientoDetalle.Archivo.Nombre))
                        return BadRequest(new { message = "Debe indicar un nombre de archivo" });

                    if (relevamiento.TipoDeProductoId == (int)TipoDeProductoEnum.Extintores)
                    {
                        if (relevamientoDetalle.ProductoId == 0 || !relevamientoDetalle.PuestoId.HasValue || relevamientoDetalle.PuestoId.Value == 0)
                            return BadRequest(new { message = "Debe indicar el extintor y el puesto." });

                        // Extintor existente
                        if (relevamientoDetalle.ProductoId > 0)
                        {
                            var extintor = await _context.Extintores.FindAsync(relevamientoDetalle.ProductoId);
                            if (extintor == null || extintor.SucursalId != relevamiento.SucursalId)
                                return BadRequest(new { message = "El producto indicado es incorrecto." });
                        }
                        else
                        {
                            // CREACIÓN DE NUEVO EXTINTOR
                            if (detalleReq.Extintor == null)
                                return BadRequest(new { message = "Debe indicar los datos del nuevo extintor en el tag 'Extintor'." });

                            // Validar nro serie único por sucursal
                            if (!string.IsNullOrEmpty(detalleReq.Extintor.NroSerie) &&
                                await _context.Extintores.AnyAsync(x => x.Activo && x.SucursalId == relevamiento.SucursalId && x.NroSerie == detalleReq.Extintor.NroSerie))
                                return BadRequest(new { message = "Ya existe un extintor con ese número de serie en esa sucursal." });

                            // Mapear DTO -> entidad (mínimo necesario)
                            var newExtintor = new Extintor
                            {
                                SucursalId = relevamiento.SucursalId,
                                ClienteId = relevamiento.Sucursal?.ClienteId,
                                NroSerie = detalleReq.Extintor.NroSerie,
                                TipoDeCargaId = detalleReq.Extintor.TipoDeCargaId ?? 0,
                                CapacidadId = detalleReq.Extintor.CapacidadId ?? 0,
                                VencimientoCarga = detalleReq.Extintor.VencimientoCarga ?? DateTime.UtcNow,
                                VencimientoPH = detalleReq.Extintor.VencimientoPH ?? DateTime.UtcNow,
                                Orden = detalleReq.Extintor.Orden ?? 0,
                                Incorporacion = detalleReq.Extintor.Incorporacion ?? DateTime.UtcNow,
                                Reserva = detalleReq.Extintor.Reserva ?? false,
                                Baja = detalleReq.Extintor.Baja ?? false,
                                Ubicacion = detalleReq.Extintor.Ubicacion,
                                Codigo = detalleReq.Extintor.Codigo,
                                UsuarioCreacion = userId.Value.ToString(),
                                UsuarioUpdate = userId.Value.ToString()
                            };

                            _context.Extintores.Add(newExtintor);
                            await _context.SaveChangesAsync();

                            // guardar mapping de id temporal -> real
                            if (detalleReq.ProductoId < 0)
                                tempIdToRealProductoId[detalleReq.ProductoId] = newExtintor.Id;

                            relevamientoDetalle.ProductoId = newExtintor.Id;
                        }

                        // Puesto existente
                        if (relevamientoDetalle.PuestoId.HasValue && relevamientoDetalle.PuestoId.Value > 0)
                        {
                            var puesto = await _context.Puestos.FindAsync(relevamientoDetalle.PuestoId.Value);
                            if (puesto == null || puesto.SucursalId != relevamiento.SucursalId)
                                return BadRequest(new { message = "El puesto indicado es incorrecto." });

                            if (puesto.ExtintorId != relevamientoDetalle.ProductoId)
                            {
                                puesto.ExtintorId = relevamientoDetalle.ProductoId;
                                _context.Puestos.Update(puesto);
                            }
                        }
                        else
                        {
                            // CREACIÓN DE NUEVO PUESTO
                            if (detalleReq.Puesto == null)
                                return BadRequest(new { message = "Debe indicar los datos del nuevo puesto en el tag 'Puesto'." });

                            if (!string.IsNullOrEmpty(detalleReq.Puesto.Nombre) &&
                                await _context.Puestos.AnyAsync(x => x.Activo && x.SucursalId == relevamiento.SucursalId && x.Nombre == detalleReq.Puesto.Nombre))
                                return BadRequest(new { message = "Ya existe un puesto con ese nombre en esa sucursal." });

                            var newPuesto = new Puesto
                            {
                                SucursalId = relevamiento.SucursalId,
                                ExtintorId = relevamientoDetalle.ProductoId,
                                Nombre = detalleReq.Puesto.Nombre,
                                Ubicacion = detalleReq.Puesto.Ubicacion,
                                Codigo = detalleReq.Puesto.Codigo,
                                UsuarioCreacion = userId.Value.ToString(),
                                UsuarioUpdate = userId.Value.ToString()
                            };

                            _context.Puestos.Add(newPuesto);
                            await _context.SaveChangesAsync();

                            relevamientoDetalle.PuestoId = newPuesto.Id;
                        }

                        // Historial Puesto-Extintor
                        _context.ExtintoresHistoria.Add(new ExtintorHistoria
                        {
                            ExtintorId = relevamientoDetalle.ProductoId,
                            PuestoId = relevamientoDetalle.PuestoId,
                            SucursalId = relevamiento.SucursalId,
                            Fecha = DateTime.UtcNow,
                            Latitud = relevamientoDetalle.Latitud,
                            Longitud = relevamientoDetalle.Longitud,
                            Descripcion = "",
                            UsuarioCreacion = userId.Value.ToString(),
                            UsuarioUpdate = userId.Value.ToString()
                        });
                    }
                    else if (relevamiento.TipoDeProductoId == (int)TipoDeProductoEnum.InstalacionesFijas)
                    {
                        if (relevamientoDetalle.ProductoId > 0)
                        {
                            var elemento = await _context.Elementos.FindAsync(relevamientoDetalle.ProductoId);
                            if (elemento == null || elemento.SucursalId != relevamiento.SucursalId)
                                return BadRequest(new { message = "El producto indicado es incorrecto." });

                            if (relevamiento.TipoDeElementoId.HasValue && elemento.TipoDeElementoId != relevamiento.TipoDeElementoId.Value)
                                return BadRequest(new { message = "El producto indicado es incorrecto." });
                        }
                        else
                        {
                            // CREACIÓN DE NUEVO ELEMENTO
                            if (detalleReq.Elemento == null)
                                return BadRequest(new { message = "Debe indicar los datos de la nueva instalación fija en el tag 'Elemento'." });

                            var newElemento = new Elemento
                            {
                                SucursalId = relevamiento.SucursalId,
                                TipoDeElementoId = (relevamiento.TipoDeElementoId ?? detalleReq.Elemento.TipoDeElementoId) ?? 0,
                                Ubicacion = detalleReq.Elemento.Ubicacion,
                                Codigo = detalleReq.Elemento.Codigo,
                                Interno = detalleReq.Elemento.Interno ?? 0,
                                UsuarioCreacion = userId.Value.ToString(),
                                UsuarioUpdate = userId.Value.ToString(),
                            };

                            _context.Elementos.Add(newElemento);
                            await _context.SaveChangesAsync();

                            var detallesElementoReq = detalleReq.Elemento.Detalles ?? new List<ElementoTipoElementoDetalleRequest>();
                            var requestIds = detallesElementoReq.Select(x => x.TipoElementoDetalleId).ToList();

                            var faltantes = tipoElementosDbIds.Except(requestIds).ToList();
                            if (faltantes.Count > 0)
                                return BadRequest(new { message = "Debe completar todos los detalles del elemento." });

                            foreach (var det in detallesElementoReq)
                            {
                                _context.ElementosTipoElementoDetalle.Add(new ElementoTipoElementoDetalle
                                {
                                    ElementoId = newElemento.Id,
                                    TipoElementoDetalleId = det.TipoElementoDetalleId,
                                    Valor = det.Valor ?? string.Empty,
                                    UsuarioCreacion = userId.Value.ToString(),
                                    UsuarioUpdate = userId.Value.ToString()
                                });
                            }

                            if (detalleReq.ProductoId < 0)
                                tempIdToRealProductoId[detalleReq.ProductoId] = newElemento.Id;

                            relevamientoDetalle.ProductoId = newElemento.Id;
                        }
                    }

                    // Asegurar relaciones para resultados/fotos
                    relevamientoDetalle.DetalleResultados = resultadosReq.Select(r => new RelevamientoDetalleResultado
                    {
                        CheckListDetalleId = r.CheckListDetalleId ?? 0,
                        Valor = r.Valor,
                        Observaciones = r.Observaciones,
                        Urgencia = r.Urgencia,
                        Conformidad = r.Conformidad ?? ParseConformidad(r.Valor),
                        ArchivoId = r.ArchivoId,
                        UsuarioCreacion = userId.Value.ToString(),
                        UsuarioUpdate = userId.Value.ToString()
                    }).ToList();

                    if (detalleReq.DetalleFotos != null && detalleReq.DetalleFotos.Any())
                    {
                        relevamientoDetalle.DetalleFotos = detalleReq.DetalleFotos
                            .Where(f => f.ArchivoId.HasValue)
                            .Select(f => new RelevamientoDetalleFoto
                            {
                                ArchivoId = f.ArchivoId!.Value,
                                UsuarioCreacion = userId.Value.ToString(),
                                UsuarioUpdate = userId.Value.ToString()
                            }).ToList();
                    }

                    _context.RelevamientoDetalles.Add(relevamientoDetalle);
                }

                await _context.SaveChangesAsync();

                // Compat: si el cliente manda ProductoId negativo, ya lo mapeamos al crear el producto.

                return CreatedAtAction("GetRelevamiento", new { id = relevamiento.Id }, new { id = relevamiento.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en FinalizarRelevamientoDetalles: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        private static bool ParseConformidad(string? valor)
        {
            if (string.IsNullOrWhiteSpace(valor)) return false;
            var v = valor.Trim().ToLowerInvariant();
            return v is "true" or "si" or "sí" or "1" or "ok";
        }
    }
}
