using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : BaseController
    {
        private readonly IUserRepository _repository;
        private readonly IUserCenterAppAccessRepository _userCenterAppAccessRepository;
        private readonly IUserClientAccessRepository _userClientAccessRepository;
        private readonly IBusinessCenterRepository _businessCenterRepository;
        private readonly IClienteRepository _clienteRepository;
        private readonly ApplicationDbContext _dbContext;

        public UsersController(
            IUserRepository repository,
            IUserCenterAppAccessRepository userCenterAppAccessRepository,
            IUserClientAccessRepository userClientAccessRepository,
            IBusinessCenterRepository businessCenterRepository,
            IClienteRepository clienteRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext dbContext)
            : base(permissionService, httpContextAccessor)
        {
            _repository = repository;
            _userCenterAppAccessRepository = userCenterAppAccessRepository;
            _userClientAccessRepository = userClientAccessRepository;
            _businessCenterRepository = businessCenterRepository;
            _clienteRepository = clienteRepository;
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var users = await _repository.GetAllWithRoleAsync();
            return Ok(users);
        }

        /// <summary>
        /// Obtiene los centros asignados a un usuario a través de UserCenterAppAccess
        /// IMPORTANTE: Esta ruta debe ir ANTES de [HttpGet("{id}")] para evitar conflictos de enrutamiento
        /// </summary>
        [HttpGet]
        [Route("{id:int}/centers")]
        public async Task<ActionResult<IEnumerable<BusinessCenter>>> GetUserCenters(int id)
        {
            try
            {
                Console.WriteLine($"=== GetUserCenters llamado para usuario {id} ===");
                // Obtener los accesos de centro del usuario
                var userCenterAccesses = await _userCenterAppAccessRepository.GetActiveByUserIdAsync(id);
                
                if (!userCenterAccesses.Any())
                {
                    return Ok(new List<BusinessCenter>());
                }

                // Obtener los IDs de los centros
                var centerIds = userCenterAccesses
                    .Select(uca => uca.BusinessCenterId)
                    .Distinct()
                    .ToList();

                // Obtener los centros
                var centers = await _businessCenterRepository.GetQueryable()
                    .Where(bc => centerIds.Contains(bc.Id) && bc.Activo)
                    .OrderBy(bc => bc.Name)
                    .ToListAsync();

                return Ok(centers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los clientes de los centros a los que tiene acceso un usuario
        /// IMPORTANTE: Esta ruta debe ir ANTES de [HttpGet("{id}")] para evitar conflictos de enrutamiento
        /// </summary>
        [HttpGet]
        [Route("{id:int}/clients")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetUserClients(int id)
        {
            try
            {
                // Obtener los accesos de centro del usuario
                var userCenterAccesses = await _userCenterAppAccessRepository.GetActiveByUserIdAsync(id);
                
                if (!userCenterAccesses.Any())
                {
                    return Ok(new List<Cliente>());
                }

                // Obtener los IDs de los centros
                var centerIds = userCenterAccesses
                    .Select(uca => uca.BusinessCenterId)
                    .Distinct()
                    .ToList();

                // Obtener los clientes de esos centros
                var clientes = await _clienteRepository.GetQueryable()
                    .Include(c => c.BusinessCenter)
                    .Include(c => c.TipoDeCliente)
                    .Include(c => c.TipoDeServicio)
                    .Include(c => c.Vendedor)
                    .Where(c => centerIds.Contains(c.BusinessCenterId) && c.Activo)
                    .OrderBy(c => c.Nombre)
                    .ToListAsync();

                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetById(int id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<User>> Create(User user)
        {
            await _repository.AddAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, User user)
        {
            if (id != user.Id) return BadRequest();
            await _repository.UpdateAsync(user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null) return NotFound();
            await _repository.DeleteAsync(user);
            return NoContent();
        }

        /// <summary>
        /// Asigna un centro a un usuario
        /// IMPORTANTE: Esta ruta debe ir ANTES de [HttpPut("{id}")] para evitar conflictos de enrutamiento
        /// </summary>
        [HttpPost]
        [Route("{id:int}/centers")]
        public async Task<ActionResult> AssignCenterToUser(int id, [FromBody] AssignCenterRequest request)
        {
            try
            {
                Console.WriteLine($"=== AssignCenterToUser llamado ===");
                Console.WriteLine($"UserId: {id}, CenterId: {request?.CenterId}, AppId: {request?.AppId}");
                
                // Verificar que el request no sea null
                if (request == null)
                {
                    Console.WriteLine("Error: Request es null");
                    return BadRequest(new { message = "Request body no puede ser null" });
                }

                // Verificar que el usuario existe
                var user = await _repository.GetByIdAsync(id);
                if (user == null)
                {
                    Console.WriteLine($"Error: Usuario {id} no encontrado");
                    return NotFound(new { message = "Usuario no encontrado" });
                }
                Console.WriteLine($"Usuario encontrado: {user.Alias}");

                // Verificar que el centro existe
                var center = await _businessCenterRepository.GetByIdAsync(request.CenterId);
                if (center == null)
                {
                    Console.WriteLine($"Error: Centro {request.CenterId} no encontrado");
                    return NotFound(new { message = "Centro no encontrado" });
                }
                Console.WriteLine($"Centro encontrado: {center.Name}");

                // Obtener el AppId (usar el del request o el default del usuario)
                int appId = request.AppId ?? 1; // Por defecto usar app 1 (web app)
                Console.WriteLine($"AppId: {appId}");

                // Verificar si ya existe el acceso
                var existingAccess = await _userCenterAppAccessRepository
                    .GetByUserIdAndBusinessCenterIdAndAppIdAsync(id, request.CenterId, appId);
                Console.WriteLine($"Acceso existente: {existingAccess != null}, Activo: {existingAccess?.Active}");

                if (existingAccess != null)
                {
                    if (existingAccess.Active)
                    {
                        Console.WriteLine("El usuario ya tiene acceso activo a este centro");
                        return Conflict(new { message = "El usuario ya tiene acceso a este centro" });
                    }
                    else
                    {
                        Console.WriteLine("Reactivando acceso existente");
                        // Reactivar acceso existente
                        existingAccess.Active = true;
                        existingAccess.AccessLevel = request.AccessLevel ?? "full";
                        existingAccess.IsDefault = request.IsDefault ?? false;
                        existingAccess.GrantedAt = DateTime.UtcNow;
                        existingAccess.ExpiresAt = request.ExpiresAt;
                        existingAccess.GrantedBy = GetCurrentUserId() ?? 1;
                        existingAccess.UsuarioUpdate = "system";
                        await _userCenterAppAccessRepository.UpdateAsync(existingAccess);
                        Console.WriteLine("Acceso reactivado exitosamente");
                        return Ok(new { 
                            message = "Centro asignado correctamente", 
                            access = new {
                                id = existingAccess.Id,
                                userId = existingAccess.UserId,
                                businessCenterId = existingAccess.BusinessCenterId,
                                appId = existingAccess.AppId,
                                accessLevel = existingAccess.AccessLevel,
                                isDefault = existingAccess.IsDefault,
                                grantedAt = existingAccess.GrantedAt,
                                expiresAt = existingAccess.ExpiresAt,
                                grantedBy = existingAccess.GrantedBy,
                                active = existingAccess.Active
                            }
                        });
                    }
                }

                Console.WriteLine("Creando nuevo acceso");
                // Crear nuevo acceso
                var currentUserId = GetCurrentUserId() ?? 1;
                
                // Asegurarse de que AccessLevel no sea null o vacío
                var accessLevel = !string.IsNullOrWhiteSpace(request.AccessLevel) ? request.AccessLevel : "full";
                
                var userCenterAccess = new UserCenterAppAccess
                {
                    UserId = id,
                    BusinessCenterId = request.CenterId,
                    AppId = appId,
                    AccessLevel = accessLevel,
                    IsDefault = request.IsDefault ?? false,
                    GrantedAt = DateTime.UtcNow,
                    ExpiresAt = request.ExpiresAt,
                    GrantedBy = currentUserId,
                    Active = true,
                    Activo = true, // Asegurar que Activo esté establecido
                    FechaCreacion = DateTime.UtcNow,
                    UsuarioCreacion = "system",
                    UsuarioUpdate = "system"
                };

                Console.WriteLine($"Guardando nuevo acceso - UserId: {userCenterAccess.UserId}, CenterId: {userCenterAccess.BusinessCenterId}, AppId: {userCenterAccess.AppId}");
                
                // Verificar que las entidades relacionadas existan
                var userExists = await _dbContext.Users.AnyAsync(u => u.Id == id && u.Activo);
                var centerExists = await _dbContext.BusinessCenters.AnyAsync(bc => bc.Id == request.CenterId && bc.Activo);
                var appExists = await _dbContext.Applications.AnyAsync(a => a.Id == appId && a.Active);
                
                Console.WriteLine($"Validaciones - User existe: {userExists}, Center existe: {centerExists}, App existe: {appExists}");
                
                if (!userExists)
                {
                    return BadRequest(new { message = "El usuario especificado no existe o está inactivo" });
                }
                if (!centerExists)
                {
                    return BadRequest(new { message = "El centro especificado no existe o está inactivo" });
                }
                if (!appExists)
                {
                    return BadRequest(new { message = "La aplicación especificada no existe o está inactiva" });
                }
                
                try
                {
                    // Usar el contexto directamente para tener más control
                    _dbContext.UserCenterAppAccesses.Add(userCenterAccess);
                    await _dbContext.SaveChangesAsync();
                    Console.WriteLine($"Acceso creado exitosamente con ID: {userCenterAccess.Id}");
                    
                    // Devolver solo los datos necesarios sin las propiedades de navegación
                    return Ok(new { 
                        message = "Centro asignado correctamente", 
                        access = new {
                            id = userCenterAccess.Id,
                            userId = userCenterAccess.UserId,
                            businessCenterId = userCenterAccess.BusinessCenterId,
                            appId = userCenterAccess.AppId,
                            accessLevel = userCenterAccess.AccessLevel,
                            isDefault = userCenterAccess.IsDefault,
                            grantedAt = userCenterAccess.GrantedAt,
                            expiresAt = userCenterAccess.ExpiresAt,
                            grantedBy = userCenterAccess.GrantedBy,
                            active = userCenterAccess.Active
                        }
                    });
                }
                catch (DbUpdateException dbEx)
                {
                    Console.WriteLine($"=== ERROR DE BASE DE DATOS ===");
                    Console.WriteLine($"Mensaje: {dbEx.Message}");
                    Console.WriteLine($"InnerException: {dbEx.InnerException?.Message}");
                    if (dbEx.InnerException != null)
                    {
                        Console.WriteLine($"InnerException StackTrace: {dbEx.InnerException.StackTrace}");
                    }
                    
                    // Intentar obtener más detalles del error
                    var errorDetails = dbEx.InnerException?.Message ?? dbEx.Message;
                    
                    // Verificar si es un error de constraint único
                    if (errorDetails.Contains("duplicate") || errorDetails.Contains("unique") || errorDetails.Contains("UNIQUE"))
                    {
                        return Conflict(new { 
                            message = "El usuario ya tiene acceso a este centro en esta aplicación", 
                            error = errorDetails
                        });
                    }
                    
                    // Verificar si es un error de foreign key
                    if (errorDetails.Contains("foreign key") || errorDetails.Contains("FOREIGN KEY"))
                    {
                        return BadRequest(new { 
                            message = "Error de referencia: una de las entidades relacionadas no existe", 
                            error = errorDetails
                        });
                    }
                    
                    return StatusCode(500, new { 
                        message = "Error al guardar en la base de datos", 
                        error = dbEx.Message,
                        details = errorDetails 
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"=== ERROR GENERAL ===");
                    Console.WriteLine($"Tipo: {ex.GetType().Name}");
                    Console.WriteLine($"Mensaje: {ex.Message}");
                    Console.WriteLine($"StackTrace: {ex.StackTrace}");
                    if (ex.InnerException != null)
                    {
                        Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                    }
                    return StatusCode(500, new { 
                        message = "Error interno del servidor", 
                        error = ex.Message,
                        details = ex.InnerException?.Message 
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ERROR en AssignCenterToUser ===");
                Console.WriteLine($"Mensaje: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message, details = ex.StackTrace });
            }
        }

        /// <summary>
        /// Desasigna un centro de un usuario
        /// IMPORTANTE: Esta ruta debe ir ANTES de [HttpDelete("{id}")] para evitar conflictos de enrutamiento
        /// </summary>
        [HttpDelete]
        [Route("{id:int}/centers/{centerId:int}")]
        public async Task<ActionResult> RemoveCenterFromUser(int id, int centerId, [FromQuery] int? appId = null)
        {
            try
            {
                // Verificar que el usuario existe
                var user = await _repository.GetByIdAsync(id);
                if (user == null)
                    return NotFound(new { message = "Usuario no encontrado" });

                // Obtener el AppId (usar el del query o buscar todos los accesos)
                if (appId.HasValue)
                {
                    var access = await _userCenterAppAccessRepository
                        .GetByUserIdAndBusinessCenterIdAndAppIdAsync(id, centerId, appId.Value);
                    
                    if (access == null)
                        return NotFound(new { message = "Acceso no encontrado" });

                    // Desactivar en lugar de eliminar (soft delete)
                    access.Active = false;
                    access.UsuarioUpdate = "system";
                    await _userCenterAppAccessRepository.UpdateAsync(access);
                }
                else
                {
                    // Desactivar todos los accesos de este centro para este usuario
                    var accesses = await _userCenterAppAccessRepository.GetByUserIdAsync(id);
                    var centerAccesses = accesses.Where(a => a.BusinessCenterId == centerId && a.Active);
                    
                    foreach (var access in centerAccesses)
                    {
                        access.Active = false;
                        access.UsuarioUpdate = "system";
                        await _userCenterAppAccessRepository.UpdateAsync(access);
                    }
                }

                return Ok(new { message = "Centro desasignado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los clientes de un centro específico
        /// </summary>
        [HttpGet]
        [Route("centers/{centerId:int}/clients")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetCenterClients(int centerId)
        {
            try
            {
                var clientes = await _clienteRepository.GetQueryable()
                    .Include(c => c.BusinessCenter)
                    .Include(c => c.TipoDeCliente)
                    .Include(c => c.TipoDeServicio)
                    .Include(c => c.Vendedor)
                    .Where(c => c.BusinessCenterId == centerId && c.Activo)
                    .OrderBy(c => c.Nombre)
                    .ToListAsync();

                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los clientes asignados directamente a un usuario
        /// </summary>
        [HttpGet]
        [Route("{id:int}/assigned-clients")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetUserAssignedClients(int id)
        {
            try
            {
                var userClientAccesses = await _userClientAccessRepository.GetActiveByUserIdAsync(id);
                
                if (!userClientAccesses.Any())
                {
                    return Ok(new List<Cliente>());
                }

                var clienteIds = userClientAccesses
                    .Select(uca => uca.ClienteId)
                    .Distinct()
                    .ToList();

                var clientes = await _clienteRepository.GetQueryable()
                    .Include(c => c.BusinessCenter)
                    .Include(c => c.TipoDeCliente)
                    .Include(c => c.TipoDeServicio)
                    .Include(c => c.Vendedor)
                    .Where(c => clienteIds.Contains(c.Id) && c.Activo)
                    .OrderBy(c => c.Nombre)
                    .ToListAsync();

                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Asigna un cliente a un usuario
        /// </summary>
        [HttpPost]
        [Route("{id:int}/clients")]
        public async Task<ActionResult> AssignClientToUser(int id, [FromBody] AssignClientRequest request)
        {
            try
            {
                // Verificar que el usuario existe
                var user = await _repository.GetByIdAsync(id);
                if (user == null)
                    return NotFound(new { message = "Usuario no encontrado" });

                // Verificar que el cliente existe
                var cliente = await _clienteRepository.GetByIdAsync(request.ClienteId);
                if (cliente == null)
                    return NotFound(new { message = "Cliente no encontrado" });

                // Obtener el AppId (usar el del request o el default)
                int appId = request.AppId ?? 1;

                // Verificar si ya existe el acceso
                var existingAccess = await _userClientAccessRepository
                    .GetByUserIdAndClienteIdAndAppIdAsync(id, request.ClienteId, appId);

                if (existingAccess != null)
                {
                    if (existingAccess.Active)
                        return Conflict(new { message = "El usuario ya tiene acceso a este cliente" });
                    else
                    {
                        // Reactivar acceso existente
                        existingAccess.Active = true;
                        existingAccess.AccessLevel = request.AccessLevel ?? "full";
                        existingAccess.GrantedAt = DateTime.UtcNow;
                        existingAccess.ExpiresAt = request.ExpiresAt;
                        existingAccess.GrantedBy = GetCurrentUserId() ?? 1;
                        existingAccess.UsuarioUpdate = "system";
                        await _userClientAccessRepository.UpdateAsync(existingAccess);
                        return Ok(new { message = "Cliente asignado correctamente" });
                    }
                }

                // Crear nuevo acceso
                var currentUserId = GetCurrentUserId() ?? 1;
                var accessLevel = !string.IsNullOrWhiteSpace(request.AccessLevel) ? request.AccessLevel : "full";
                
                var userClientAccess = new UserClientAccess
                {
                    UserId = id,
                    ClienteId = request.ClienteId,
                    AppId = appId,
                    AccessLevel = accessLevel,
                    GrantedAt = DateTime.UtcNow,
                    ExpiresAt = request.ExpiresAt,
                    GrantedBy = currentUserId,
                    Active = true,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow,
                    UsuarioCreacion = "system",
                    UsuarioUpdate = "system"
                };

                try
                {
                    _dbContext.UserClientAccesses.Add(userClientAccess);
                    await _dbContext.SaveChangesAsync();
                    return Ok(new { message = "Cliente asignado correctamente" });
                }
                catch (DbUpdateException dbEx)
                {
                    return StatusCode(500, new { 
                        message = "Error al guardar en la base de datos", 
                        error = dbEx.Message,
                        details = dbEx.InnerException?.Message 
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        /// <summary>
        /// Desasigna un cliente de un usuario
        /// </summary>
        [HttpDelete]
        [Route("{id:int}/clients/{clienteId:int}")]
        public async Task<ActionResult> RemoveClientFromUser(int id, int clienteId, [FromQuery] int? appId = null)
        {
            try
            {
                var user = await _repository.GetByIdAsync(id);
                if (user == null)
                    return NotFound(new { message = "Usuario no encontrado" });

                if (appId.HasValue)
                {
                    var access = await _userClientAccessRepository
                        .GetByUserIdAndClienteIdAndAppIdAsync(id, clienteId, appId.Value);
                    
                    if (access == null)
                        return NotFound(new { message = "Acceso no encontrado" });

                    access.Active = false;
                    access.UsuarioUpdate = "system";
                    await _userClientAccessRepository.UpdateAsync(access);
                }
                else
                {
                    var accesses = await _userClientAccessRepository.GetByUserIdAsync(id);
                    var clientAccesses = accesses.Where(a => a.ClienteId == clienteId && a.Active);
                    
                    foreach (var access in clientAccesses)
                    {
                        access.Active = false;
                        access.UsuarioUpdate = "system";
                        await _userClientAccessRepository.UpdateAsync(access);
                    }
                }

                return Ok(new { message = "Cliente desasignado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }

    // DTOs para las requests
    public class AssignCenterRequest
    {
        public int CenterId { get; set; }
        public int? AppId { get; set; }
        public string? AccessLevel { get; set; }
        public bool? IsDefault { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class AssignClientRequest
    {
        public int ClienteId { get; set; }
        public int? AppId { get; set; }
        public string? AccessLevel { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
} 