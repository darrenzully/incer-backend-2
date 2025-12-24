using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Incer.Web.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Core.Enums;
using Serilog;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [ServiceFilter(typeof(Incer.Web.Api.Filters.LogRequestBodyFilter))]
    public class TareasController : BaseController
    {
        private readonly ITareaRepository _tareaRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITipoTareaRepository _tipoTareaRepository;
        private readonly ITipoProductoRepository _tipoProductoRepository;
        private readonly IPeriodicidadRepository _periodicidadRepository;
        private readonly IClienteRepository _clienteRepository;
        private readonly ISucursalRepository _sucursalRepository;
        private readonly ApplicationDbContext _dbContext;

        public TareasController(
            ITareaRepository tareaRepository, 
            IUnitOfWork unitOfWork,
            ITipoTareaRepository tipoTareaRepository,
            ITipoProductoRepository tipoProductoRepository,
            IPeriodicidadRepository periodicidadRepository,
            IClienteRepository clienteRepository,
            ISucursalRepository sucursalRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext dbContext)
            : base(permissionService, httpContextAccessor)
        {
            _tareaRepository = tareaRepository;
            _unitOfWork = unitOfWork;
            _tipoTareaRepository = tipoTareaRepository;
            _tipoProductoRepository = tipoProductoRepository;
            _periodicidadRepository = periodicidadRepository;
            _clienteRepository = clienteRepository;
            _sucursalRepository = sucursalRepository;
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tarea>>> GetTareas([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET TAREAS ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var userId = GetCurrentUserId();
                Console.WriteLine($"UserId actual: {userId}");
                
                if (!userId.HasValue)
                {
                    Console.WriteLine("Usuario no válido - retornando Unauthorized");
                    return Unauthorized(new { message = "Usuario no válido" });
                }

                // Verificar si el usuario es admin (tiene permiso global)
                var hasGlobalAccess = await _permissionService.CheckPermissionAsync(userId.Value, "*", "*");
                Console.WriteLine($"Usuario es admin (tiene acceso global): {hasGlobalAccess}");

                var baseQuery = _tareaRepository.GetQueryable()
                    .Include(t => t.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter);

                IQueryable<Tarea> query;

                if (hasGlobalAccess)
                {
                    // ADMIN: Ver todo de los centros accesibles
                    Console.WriteLine("Usuario es ADMIN - Aplicando filtro por centros accesibles");
                    
                    var accessibleCenters = await _permissionService.GetUserAccessibleCentersAsync(userId.Value);
                    var accessibleCentersList = accessibleCenters.ToList();
                    Console.WriteLine($"Centros accesibles: {string.Join(", ", accessibleCentersList)}");
                    
                    if (centerId.HasValue)
                    {
                        // Verificar que el centro esté en la lista de accesibles
                        if (accessibleCentersList.Contains(centerId.Value))
                        {
                            // Si se especifica un centro, filtrar por ese centro
                            query = baseQuery.Where(t => 
                                t.Sucursal != null && 
                                t.Sucursal.Cliente != null && 
                                t.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                        }
                        else
                        {
                            Console.WriteLine($"Centro {centerId.Value} no está en la lista de centros accesibles");
                            query = baseQuery.Where(t => false);
                        }
                    }
                    else if (accessibleCentersList.Any())
                    {
                        // Filtrar por todos los centros accesibles
                        query = baseQuery.Where(t => 
                            t.Sucursal != null && 
                            t.Sucursal.Cliente != null && 
                            accessibleCentersList.Contains(t.Sucursal.Cliente.BusinessCenterId));
                    }
                    else
                    {
                        // No hay centros accesibles, retornar vacío
                        query = baseQuery.Where(t => false);
                    }
                }
                else
                {
                    // USUARIO REGULAR: Solo ver de clientes asignados directamente
                    Console.WriteLine("Usuario es REGULAR - Aplicando filtro por clientes asignados");
                    
                    // Obtener clientes asignados directamente al usuario
                    var directClientAccesses = await _dbContext.UserClientAccesses
                        .Where(uca => uca.UserId == userId.Value && 
                                     uca.Active && 
                                     uca.Activo &&
                                     (uca.ExpiresAt == null || uca.ExpiresAt > DateTime.UtcNow))
                        .Select(uca => uca.ClienteId)
                        .Distinct()
                        .ToListAsync();

                    Console.WriteLine($"Clientes asignados directamente al usuario: {directClientAccesses.Count}");
                    foreach (var clienteId in directClientAccesses)
                    {
                        Console.WriteLine($"  - Cliente ID: {clienteId}");
                    }

                    if (!directClientAccesses.Any())
                    {
                        Console.WriteLine("No hay clientes asignados al usuario - retornando lista vacía");
                        query = baseQuery.Where(t => false);
                    }
                    else
                    {
                        // Si se especifica un centro, primero filtrar por centro y luego por clientes asignados
                        if (centerId.HasValue)
                        {
                            Console.WriteLine($"Filtrando por centro {centerId.Value} Y clientes asignados al usuario");
                            
                            // Obtener los clientes asignados que pertenecen a este centro
                            var clientesDelCentro = await _dbContext.Clientes
                                .Where(c => c.BusinessCenterId == centerId.Value && 
                                           directClientAccesses.Contains(c.Id))
                                .Select(c => c.Id)
                                .ToListAsync();
                            
                            Console.WriteLine($"Clientes asignados al usuario que pertenecen al centro {centerId.Value}: {clientesDelCentro.Count}");
                            foreach (var clienteId in clientesDelCentro)
                            {
                                Console.WriteLine($"  - Cliente ID: {clienteId}");
                            }
                            
                            if (!clientesDelCentro.Any())
                            {
                                Console.WriteLine("No hay clientes asignados al usuario en este centro - retornando lista vacía");
                                query = baseQuery.Where(t => false);
                            }
                            else
                            {
                                // Filtrar por clientes asignados que pertenecen al centro especificado
                                query = baseQuery.Where(t => 
                                    t.Sucursal != null && 
                                    t.Sucursal.Cliente != null && 
                                    clientesDelCentro.Contains(t.Sucursal.ClienteId));
                            }
                        }
                        else
                        {
                            // Sin centro específico, filtrar solo por clientes asignados
                            query = baseQuery.Where(t => 
                                t.Sucursal != null && 
                                t.Sucursal.Cliente != null && 
                                directClientAccesses.Contains(t.Sucursal.ClienteId));
                        }
                    }
                }

                var tareas = await query.ToListAsync();
                Console.WriteLine($"Tareas encontradas: {tareas.Count}");
                
                // Mostrar detalles de las primeras tareas encontradas
                foreach (var tarea in tareas.Take(5))
                {
                    Console.WriteLine($"Tarea ID: {tarea.Id}, UsuarioId: {tarea.UsuarioId}, Sucursal: {tarea.Sucursal?.Nombre}, Cliente: {tarea.Sucursal?.Cliente?.Nombre}, ClienteId: {tarea.Sucursal?.ClienteId}, Centro: {tarea.Sucursal?.Cliente?.BusinessCenterId}");
                }
                
                Console.WriteLine($"==================");

                return Ok(tareas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetTareas: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("pendientes")]
        public async Task<ActionResult<IEnumerable<Tarea>>> GetTareasPendientes([FromQuery] int days = 1)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int usuarioId))
                {
                    return Unauthorized(new { message = "Usuario no autenticado o ID de usuario inválido." });
                }

                var start = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
                var end = DateTime.Now.AddDays(days);
                var tareaAsignada = (int)EstadoDeTarea.Asignada;

                var query = _tareaRepository.GetQueryable()
                    .Include(t => t.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter)
                    .Where(t => t.EstadoTareaId == tareaAsignada
                        && t.UsuarioId == usuarioId
                        && t.Fecha >= start
                        && t.Fecha <= end);

                var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
                var tareas = await filteredQuery.ToListAsync();
                return Ok(tareas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("solicitudes")]
        public async Task<ActionResult<IEnumerable<Tarea>>> GetSolicitudes([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET SOLICITUDES ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                // Verificar permisos del usuario
                var userId = GetCurrentUserId();
                Console.WriteLine($"UserId actual: {userId}");
                
                if (userId.HasValue)
                {
                    // Verificar si tiene acceso global
                    var hasGlobalAccess = await _permissionService.CheckPermissionAsync(userId.Value, "*", "*");
                    Console.WriteLine($"Tiene acceso global: {hasGlobalAccess}");
                    
                    // Verificar permisos específicos para solicitudes
                    var hasSolicitudesAccess = await _permissionService.CheckPermissionAsync(userId.Value, "solicitudes", "read");
                    Console.WriteLine($"Tiene acceso a solicitudes: {hasSolicitudesAccess}");
                    
                    // Verificar centros accesibles
                    var accessibleCenters = await _permissionService.GetUserAccessibleCentersAsync(userId.Value);
                    Console.WriteLine($"Centros accesibles del usuario: {string.Join(", ", accessibleCenters)}");
                }
                else
                {
                    Console.WriteLine("Usuario no válido - retornando Unauthorized");
                    return Unauthorized(new { message = "Usuario no válido" });
                }
                
                var baseQuery = _tareaRepository.GetQueryable()
                    .Include(t => t.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter)
                    .Where(t => t.TipoSolicitudId != null);

                IQueryable<Tarea> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando solicitudes por centro específico: {centerId}");
                    
                    // Verificar cuántas solicitudes hay en total
                    var totalSolicitudes = await baseQuery.CountAsync();
                    Console.WriteLine($"Total de solicitudes: {totalSolicitudes}");
                    
                    // Si no hay solicitudes, verificar si hay datos en la tabla
                    if (totalSolicitudes == 0)
                    {
                        var totalSolicitudesSinInclude = await _tareaRepository.GetQueryable()
                            .Where(t => t.TipoSolicitudId != null)
                            .CountAsync();
                        Console.WriteLine($"Total de solicitudes sin Include: {totalSolicitudesSinInclude}");
                        
                        if (totalSolicitudesSinInclude > 0)
                        {
                            Console.WriteLine("Hay solicitudes pero el Include está fallando");
                        }
                        else
                        {
                            Console.WriteLine("No hay solicitudes en la base de datos");
                        }
                    }
                    
                    // Verificar cuántas sucursales hay para este centro
                    var sucursalesDelCentro = await _sucursalRepository.GetQueryable()
                        .Where(s => s.Cliente.BusinessCenterId == centerId.Value)
                        .CountAsync();
                    Console.WriteLine($"Sucursales del centro {centerId}: {sucursalesDelCentro}");
                    
                    // Verificar algunas solicitudes para debug
                    var sampleSolicitudes = await baseQuery.Take(3).ToListAsync();
                    foreach (var solicitud in sampleSolicitudes)
                    {
                        Console.WriteLine($"Solicitud ID: {solicitud.Id}, Sucursal ID: {solicitud.SucursalId}, Sucursal: {solicitud.Sucursal?.Nombre}, Cliente: {solicitud.Sucursal?.Cliente?.Nombre}, Centro: {solicitud.Sucursal?.Cliente?.BusinessCenterId}");
                    }
                    
                    query = baseQuery.Where(t => t.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                    
                    // Verificar cuántas solicitudes quedan después del filtro
                    var solicitudesDespuesDelFiltro = await query.CountAsync();
                    Console.WriteLine($"Solicitudes después del filtro: {solicitudesDespuesDelFiltro}");
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles para solicitudes");
                    
                    // Verificar cuántas solicitudes hay en total
                    var totalSolicitudes = await baseQuery.CountAsync();
                    Console.WriteLine($"Total de solicitudes: {totalSolicitudes}");
                    
                    var currentUserId = GetCurrentUserId();
                    Console.WriteLine($"UserId actual: {currentUserId}");
                    
                    var accessibleCenters = await _permissionService.GetUserAccessibleCentersAsync(currentUserId.Value);
                    Console.WriteLine($"Centros accesibles: {string.Join(", ", accessibleCenters)}");
                    
                    query = await ApplyCenterFilterAsync(baseQuery, "Sucursal.Cliente.BusinessCenterId");
                }

                var solicitudes = await query.ToListAsync();
                Console.WriteLine($"Solicitudes encontradas: {solicitudes.Count}");
                
                // Mostrar detalles de las primeras solicitudes encontradas
                foreach (var solicitud in solicitudes.Take(3))
                {
                    Console.WriteLine($"Solicitud ID: {solicitud.Id}, Sucursal: {solicitud.Sucursal?.Nombre}, Cliente: {solicitud.Sucursal?.Cliente?.Nombre}, Centro: {solicitud.Sucursal?.Cliente?.BusinessCenterId}");
                }
                
                Console.WriteLine($"========================");

                return Ok(solicitudes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetSolicitudes: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tarea>> GetTarea(int id)
        {
            var tarea = await _tareaRepository.GetByIdAsync(id);
            if (tarea == null)
            {
                return NotFound();
            }
            return Ok(tarea);
        }

        [HttpPost]
        public async Task<ActionResult<Tarea>> CreateTarea([FromBody] TareaCreateRequest? request)
        {
            // Log inmediato al entrar al método
            Log.Information("\n\n{Separator}", new string('=', 80));
            Log.Information("=== CREATE TAREA METHOD CALLED ===");
            Log.Information("Timestamp: {Timestamp}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
            Log.Information("Request Path: {Path}", Request.Path);
            Log.Information("Request Method: {Method}", Request.Method);
            Log.Information("Content-Type: {ContentType}", Request.ContentType);
            Log.Information("Content-Length: {ContentLength}", Request.ContentLength);
            Log.Information("Request es null: {IsNull}", request == null);
            Log.Information("{Separator}\n", new string('=', 80));
            
            try
            {
                Log.Information("=== POST CREATE TAREA ===");
                Log.Information("Request recibido - Verificando request...");
                
                // Verificar si el request es null
                if (request == null)
                {
                    Log.Warning("ERROR: Request es null");
                    Log.Warning("Content-Type: {ContentType}", Request.ContentType);
                    Log.Warning("Content-Length: {ContentLength}", Request.ContentLength);
                    
                    // Intentar leer el body raw
                    Request.EnableBuffering();
                    Request.Body.Position = 0;
                    using (var reader = new StreamReader(Request.Body, leaveOpen: true))
                    {
                        var body = await reader.ReadToEndAsync();
                        Log.Warning("Body raw recibido: {Body}", body);
                    }
                    Request.Body.Position = 0;
                    
                    return BadRequest(new { message = "Request body es null o no se pudo deserializar", contentType = Request.ContentType });
                }
                
                Log.Information("Request no es null - Verificando ModelState...");
                
                // Log del estado del modelo
                if (!ModelState.IsValid)
                {
                    Log.Warning("ERROR: ModelState no es válido");
                    foreach (var error in ModelState)
                    {
                        Log.Warning("  - Key: {Key}", error.Key);
                        foreach (var errorMessage in error.Value.Errors)
                        {
                            Log.Warning("    Error: {ErrorMessage}", errorMessage.ErrorMessage);
                            if (!string.IsNullOrEmpty(errorMessage.Exception?.Message))
                            {
                                Log.Error("    Exception: {ExceptionMessage}", errorMessage.Exception.Message);
                            }
                        }
                    }
                    return BadRequest(ModelState);
                }

                Log.Information("ModelState es válido - Procesando request...");
                
                // Log de todos los datos recibidos
                Log.Information("Datos recibidos en request:");
                Log.Information("  Nombre: {Nombre}", request.Nombre);
                Log.Information("  Descripcion: {Descripcion}", request.Descripcion ?? "null");
                Log.Information("  SucursalId: {SucursalId}", request.SucursalId);
                Log.Information("  ClienteId: {ClienteId}", request.ClienteId?.ToString() ?? "null");
                Log.Information("  PresupuestoId: {PresupuestoId}", request.PresupuestoId?.ToString() ?? "null");
                Log.Information("  ContactoId: {ContactoId}", request.ContactoId?.ToString() ?? "null");
                Log.Information("  TipoDeTareaId: {TipoDeTareaId}", request.TipoDeTareaId);
                Log.Information("  TipoSolicitudId: {TipoSolicitudId}", request.TipoSolicitudId?.ToString() ?? "null");
                Log.Information("  PeriodicidadId: {PeriodicidadId}", request.PeriodicidadId?.ToString() ?? "null");
                Log.Information("  PrioridadId: {PrioridadId}", request.PrioridadId?.ToString() ?? "null");
                Log.Information("  TipoDeProductoId: {TipoDeProductoId}", request.TipoDeProductoId?.ToString() ?? "null");
                Log.Information("  TipoDeElementoId: {TipoDeElementoId}", request.TipoDeElementoId?.ToString() ?? "null");
                Log.Information("  Fecha: {Fecha}", request.Fecha);
                Log.Information("  FechaFin: {FechaFin}", request.FechaFin?.ToString() ?? "null");
                Log.Information("  FechaRecepcion: {FechaRecepcion}", request.FechaRecepcion?.ToString() ?? "null");
                Log.Information("  EstadoTareaId: {EstadoTareaId}", request.EstadoTareaId);
                Log.Information("  UsuarioId: {UsuarioId}", request.UsuarioId);
                Log.Information("  Duracion: {Duracion}", request.Duracion);
                Log.Information("  Frecuencia: {Frecuencia}", request.Frecuencia);
                Log.Information("  ArchivoId: {ArchivoId}", request.ArchivoId?.ToString() ?? "null");
                Log.Information("  RemitoId: {RemitoId}", request.RemitoId?.ToString() ?? "null");
                Log.Information("  Activo: {Activo}", request.Activo);

                // Verificar usuario actual
                var currentUserId = GetCurrentUserId();
                Log.Information("Usuario actual del contexto: {UserId}", currentUserId?.ToString() ?? "null");

                // Crear la entidad Tarea
                Log.Information("Creando entidad Tarea...");
                // Ya no necesitamos parsear FechaRecepcion, viene como DateTime? directamente

                var tarea = new Tarea
                {
                    Nombre = request.Nombre,
                    Descripcion = request.Descripcion,
                    SucursalId = request.SucursalId,
                    PresupuestoId = request.PresupuestoId,
                    ContactoId = request.ContactoId,
                    TipoDeTareaId = request.TipoDeTareaId,
                    TipoSolicitudId = request.TipoSolicitudId,
                    PeriodicidadId = request.PeriodicidadId,
                    PrioridadId = request.PrioridadId,
                    TipoDeProductoId = request.TipoDeProductoId,
                    TipoDeElementoId = request.TipoDeElementoId,
                    Fecha = request.Fecha,
                    FechaFin = request.FechaFin,
                    FechaRecepcion = request.FechaRecepcion,  // Directamente, sin parsear
                    EstadoTareaId = request.EstadoTareaId,
                    UsuarioId = request.UsuarioId,
                    Duracion = request.Duracion,
                    Frecuencia = request.Frecuencia,
                    ArchivoId = request.ArchivoId,
                    RemitoId = request.RemitoId,
                    Activo = request.Activo
                };

                Log.Information("Entidad Tarea creada - Agregando al repositorio...");
                await _tareaRepository.AddAsync(tarea);
                Log.Information("Tarea agregada al repositorio - Guardando cambios...");

                await _unitOfWork.SaveChangesAsync();
                Log.Information("Cambios guardados exitosamente - Tarea ID: {TareaId}", tarea.Id);
                Log.Information("=========================");

                return CreatedAtAction(nameof(GetTarea), new { id = tarea.Id }, tarea);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "ERROR en CreateTarea");
                if (ex.InnerException != null)
                {
                    Log.Error(ex.InnerException, "InnerException en CreateTarea");
                }
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTarea(int id, TareaUpdateRequest request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var tarea = await _tareaRepository.GetByIdAsync(id);
            if (tarea == null)
            {
                return NotFound();
            }

            // Actualizar propiedades
            tarea.Nombre = request.Nombre;
            tarea.Descripcion = request.Descripcion;
            tarea.SucursalId = request.SucursalId;
            tarea.PresupuestoId = request.PresupuestoId;
            tarea.ContactoId = request.ContactoId;
            tarea.TipoDeTareaId = request.TipoDeTareaId;
            tarea.TipoSolicitudId = request.TipoSolicitudId;
            tarea.PeriodicidadId = request.PeriodicidadId;
            tarea.PrioridadId = request.PrioridadId;
            tarea.TipoDeProductoId = request.TipoDeProductoId;
            tarea.TipoDeElementoId = request.TipoDeElementoId;
            tarea.Fecha = request.Fecha;
            tarea.FechaFin = request.FechaFin;
            tarea.FechaRecepcion = request.FechaRecepcion;  // Directamente, sin parsear (ya es DateTime?)
            tarea.EstadoTareaId = request.EstadoTareaId;
            tarea.UsuarioId = request.UsuarioId;
            tarea.Duracion = request.Duracion;
            tarea.Frecuencia = request.Frecuencia;
            tarea.ArchivoId = request.ArchivoId;
            tarea.RemitoId = request.RemitoId;
            tarea.Activo = request.Activo;

            await _tareaRepository.UpdateAsync(tarea);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTarea(int id)
        {
            var tarea = await _tareaRepository.GetByIdAsync(id);
            if (tarea == null)
            {
                return NotFound();
            }

            await _tareaRepository.DeleteAsync(tarea);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Tarea>>> GetTareasByUsuario(int usuarioId)
        {
            var tareas = await _tareaRepository.GetTareasByUsuarioAsync(usuarioId);
            return Ok(tareas);
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<Tarea>>> GetTareasBySucursal(int sucursalId)
        {
            var tareas = await _tareaRepository.GetTareasBySucursalAsync(sucursalId);
            return Ok(tareas);
        }

        // Endpoints para obtener datos de dropdowns
        [HttpGet("dropdowns/tipos-tarea")]
        public async Task<ActionResult<IEnumerable<TipoTarea>>> GetTiposTarea()
        {
            var tipos = await _tipoTareaRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("dropdowns/tipos-producto")]
        public async Task<ActionResult<IEnumerable<TipoDeProducto>>> GetTiposProducto()
        {
            var tipos = await _tipoProductoRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("dropdowns/periodicidades")]
        public async Task<ActionResult<IEnumerable<Periodicidad>>> GetPeriodicidades()
        {
            var periodicidades = await _periodicidadRepository.GetAllAsync();
            return Ok(periodicidades);
        }

        [HttpGet("dropdowns/clientes")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            var clientes = await _clienteRepository.GetAllAsync();
            return Ok(clientes);
        }

        [HttpGet("dropdowns/sucursales")]
        public async Task<ActionResult<IEnumerable<Sucursal>>> GetSucursales()
        {
            var sucursales = await _sucursalRepository.GetAllAsync();
            return Ok(sucursales);
        }
    }
}
