using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RolesController : ControllerBase
    {
        private readonly IRoleRepository _repository;
        private readonly ApplicationDbContext _context;

        public RolesController(IRoleRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetAll()
        {
            var roles = await _repository.GetAllAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetById(int id)
        {
            // Usar GetByIdWithPermissionsAsync para incluir los permisos
            var role = await _repository.GetByIdWithPermissionsAsync(id);
            if (role == null) return NotFound();
            
            // Devolver un objeto anónimo para evitar problemas de serialización
            // y asegurar que los permisos se incluyan correctamente
            var rolePermissions = role.RolePermissions
                .Where(rp => rp.Activo)
                .Select(rp => new
                {
                    id = rp.Id,
                    roleId = rp.RoleId,
                    permissionId = rp.PermissionId,
                    isGranted = rp.IsGranted,
                    grantedAt = rp.GrantedAt,
                    grantedBy = rp.GrantedBy,
                    activo = rp.Activo,
                    permission = rp.Permission != null ? new
                    {
                        id = rp.Permission.Id,
                        name = rp.Permission.Name,
                        description = rp.Permission.Description,
                        resource = rp.Permission.Resource,
                        action = rp.Permission.Action,
                        scope = rp.Permission.Scope,
                        isSystem = rp.Permission.IsSystem,
                        activo = rp.Permission.Activo
                    } : null
                })
                .ToList();
            
            var result = new
            {
                id = role.Id,
                name = role.Name,
                description = role.Description,
                isSystem = role.IsSystem,
                priority = role.Priority,
                activo = role.Activo,
                fechaCreacion = role.FechaCreacion,
                fechaUpdate = role.FechaUpdate,
                usuarioCreacion = role.UsuarioCreacion,
                usuarioUpdate = role.UsuarioUpdate,
                rolePermissions = rolePermissions
            };
            
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Role>> Create(Role role)
        {
            await _repository.AddAsync(role);
            return CreatedAtAction(nameof(GetById), new { id = role.Id }, role);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                Console.WriteLine($"=== UPDATE ROLE ===");
                Console.WriteLine($"Role ID: {id}, Request ID: {request?.Id}");
                
                if (request == null)
                {
                    Console.WriteLine("ERROR: Request es null");
                    return BadRequest(new { message = "Request body no puede ser null" });
                }
                
                var permissionIdsStr = request.PermissionIds != null ? string.Join(", ", request.PermissionIds) : "null";
                Console.WriteLine($"PermissionIds recibidos: {permissionIdsStr}");
                
                if (id != request.Id) 
                {
                    Console.WriteLine($"ERROR: ID mismatch - Route ID: {id}, Request ID: {request.Id}");
                    return BadRequest(new { message = "El ID de la ruta no coincide con el ID del request" });
                }
                
                var role = await _repository.GetByIdAsync(id);
                if (role == null)
                {
                    Console.WriteLine($"ERROR: Rol {id} no encontrado");
                    return NotFound(new { message = "Rol no encontrado" });
                }

                // Actualizar propiedades básicas del rol
                if (!string.IsNullOrWhiteSpace(request.Name))
                    role.Name = request.Name;
                if (!string.IsNullOrWhiteSpace(request.Description))
                    role.Description = request.Description;
                if (request.IsSystem.HasValue)
                    role.IsSystem = request.IsSystem.Value;
                if (request.Priority.HasValue)
                    role.Priority = request.Priority.Value;
                if (request.Activo.HasValue)
                    role.Activo = request.Activo.Value;

                await _repository.UpdateAsync(role);

                // Si se enviaron permissionIds, actualizar los permisos del rol
                if (request.PermissionIds != null)
                {
                    Console.WriteLine($"Procesando {request.PermissionIds.Count} permisos");
                    
                    // Usar una transacción para asegurar consistencia
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        // Solo obtener los IDs de los permisos activos (no cargar las entidades completas)
                        var existingActivePermissionIds = await _context.RolePermissions
                            .Where(rp => rp.RoleId == id && rp.Activo)
                            .Select(rp => rp.PermissionId)
                            .ToListAsync();
                        
                        // Obtener los IDs de todos los permisos (activos e inactivos) para verificación inicial
                        var allExistingPermissionIdsInitial = await _context.RolePermissions
                            .Where(rp => rp.RoleId == id)
                            .Select(rp => rp.PermissionId)
                            .ToListAsync();
                        
                        var newPermissionIds = request.PermissionIds.Distinct().ToList(); // Asegurar que no hay duplicados en el request
                        
                        Console.WriteLine($"Permisos activos existentes: {string.Join(", ", existingActivePermissionIds)}");
                        Console.WriteLine($"Permisos nuevos (request): {string.Join(", ", newPermissionIds)}");

                        // Remover permisos que ya no están en la lista (desactivar los activos)
                        var permissionsToRemoveIds = existingActivePermissionIds
                            .Where(pid => !newPermissionIds.Contains(pid))
                            .ToList();

                        Console.WriteLine($"Permisos a remover (desactivar): {permissionsToRemoveIds.Count}");
                        foreach (var permissionIdToRemove in permissionsToRemoveIds)
                        {
                            Console.WriteLine($"Desactivando permiso {permissionIdToRemove}");
                            // Cargar la entidad específica para actualizarla
                            var toUpdate = await _context.RolePermissions
                                .FirstOrDefaultAsync(rp => rp.RoleId == id && rp.PermissionId == permissionIdToRemove && rp.Activo);
                            if (toUpdate != null)
                            {
                                toUpdate.Activo = false;
                                toUpdate.UsuarioUpdate = "system";
                                toUpdate.FechaUpdate = System.DateTime.UtcNow;
                            }
                        }

                        // Guardar cambios de desactivación primero
                        await _context.SaveChangesAsync();
                        Console.WriteLine("Cambios de desactivación guardados");

                        // Procesar los permisos del request:
                        // 1. Los que ya están activos - no hacer nada
                        // 2. Los que están inactivos - reactivarlos
                        // 3. Los que NO existen - crearlos
                        var permissionsToReactivate = new List<int>();
                        var permissionsToCreate = new List<int>();
                        
                        // Recargar la lista de todos los permisos existentes después de desactivar
                        var allExistingRolePermissions = await _context.RolePermissions
                            .AsNoTracking()
                            .Where(rp => rp.RoleId == id)
                            .ToListAsync();
                        
                        var allExistingPermissionIds = allExistingRolePermissions.Select(rp => rp.PermissionId).ToList();
                        
                        foreach (var permissionId in newPermissionIds)
                        {
                            // Verificar si el permiso existe en la tabla Permissions
                            var permissionExists = await _context.Permissions
                                .AnyAsync(p => p.Id == permissionId && p.Activo);
                            
                            if (!permissionExists)
                            {
                                Console.WriteLine($"ADVERTENCIA: PermissionId {permissionId} no existe o está inactivo en la tabla Permissions - saltando");
                                continue;
                            }

                            // Buscar en la lista de permisos existentes del rol
                            var existingRolePermission = allExistingRolePermissions
                                .FirstOrDefault(rp => rp.PermissionId == permissionId);

                            if (existingRolePermission != null)
                            {
                                // Existe, verificar si necesita reactivación
                                if (!existingRolePermission.Activo)
                                {
                                    permissionsToReactivate.Add(permissionId);
                                }
                                // Si ya está activo, no hacer nada
                            }
                            else
                            {
                                // NO existe en la lista, agregar a la lista de creación
                                permissionsToCreate.Add(permissionId);
                            }
                        }
                        
                        Console.WriteLine($"Permisos a reactivar: {permissionsToReactivate.Count} - {string.Join(", ", permissionsToReactivate)}");
                        Console.WriteLine($"Permisos a crear: {permissionsToCreate.Count} - {string.Join(", ", permissionsToCreate)}");
                        
                        // Reactivar permisos inactivos
                        foreach (var permissionId in permissionsToReactivate)
                        {
                            var existingRolePermission = await _context.RolePermissions
                                .FirstOrDefaultAsync(rp => rp.RoleId == id && rp.PermissionId == permissionId);
                            
                            if (existingRolePermission != null && !existingRolePermission.Activo)
                            {
                                Console.WriteLine($"Reactivando RolePermission (ID: {existingRolePermission.Id}) para PermissionId: {permissionId}");
                                existingRolePermission.Activo = true;
                                existingRolePermission.UsuarioUpdate = "system";
                                existingRolePermission.FechaUpdate = System.DateTime.UtcNow;
                            }
                        }
                        
                        // Crear nuevos permisos usando SQL directo (solo los que realmente no existen)
                        if (permissionsToCreate.Count > 0)
                        {
                            Console.WriteLine($"Creando {permissionsToCreate.Count} nuevos RolePermissions usando SQL directo");
                            
                            var now = System.DateTime.UtcNow;
                            foreach (var permissionId in permissionsToCreate)
                            {
                                // Verificar una última vez antes de insertar (por si acaso se creó entre la verificación y ahora)
                                var existsCheck = await _context.RolePermissions
                                    .AsNoTracking()
                                    .AnyAsync(rp => rp.RoleId == id && rp.PermissionId == permissionId);
                                
                                if (existsCheck)
                                {
                                    Console.WriteLine($"ADVERTENCIA: PermissionId {permissionId} existe en verificación final - saltando creación");
                                    continue;
                                }
                                
                                try
                                {
                                    // Usar INSERT con manejo de errores para evitar problemas de secuencia de IDs
                                    // Primero, verificar si realmente no existe
                                    var finalExistsCheck = await _context.RolePermissions
                                        .AsNoTracking()
                                        .AnyAsync(rp => rp.RoleId == id && rp.PermissionId == permissionId);
                                    
                                    if (finalExistsCheck)
                                    {
                                        Console.WriteLine($"RolePermission ya existe para PermissionId: {permissionId} - saltando");
                                        continue;
                                    }
                                    
                                    // Obtener el siguiente ID disponible manualmente para evitar problemas de secuencia
                                    var maxIdQuery = await _context.RolePermissions
                                        .AsNoTracking()
                                        .MaxAsync(rp => (int?)rp.Id) ?? 0;
                                    
                                    var nextId = maxIdQuery + 1;
                                    
                                    // Asegurar que la secuencia esté sincronizada
                                    await _context.Database.ExecuteSqlRawAsync(
                                        $"SELECT setval('\"RolePermissions_Id_seq\"', {maxIdQuery}, true)");
                                    
                                    // Insertar con ID explícito para evitar problemas de secuencia
                                    var sqlInsert = @"
                                        INSERT INTO ""RolePermissions"" 
                                        (""Id"", ""RoleId"", ""PermissionId"", ""IsGranted"", ""GrantedAt"", ""GrantedBy"", ""Activo"", ""FechaCreacion"", ""UsuarioCreacion"", ""UsuarioUpdate"")
                                        SELECT {0}, {1}, {2}, true, {3}, 1, true, {3}, 'system', 'system'
                                        WHERE NOT EXISTS (
                                            SELECT 1 FROM ""RolePermissions"" 
                                            WHERE ""RoleId"" = {1} AND ""PermissionId"" = {2}
                                        )";
                                    
                                    var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                                        sqlInsert, nextId, id, permissionId, now);
                                    
                                    if (rowsAffected > 0)
                                    {
                                        Console.WriteLine($"RolePermission creado exitosamente con ID {nextId} para PermissionId: {permissionId}");
                                        // Actualizar la secuencia después de la inserción exitosa
                                        await _context.Database.ExecuteSqlRawAsync(
                                            $"SELECT setval('\"RolePermissions_Id_seq\"', {nextId}, true)");
                                    }
                                    else
                                    {
                                        Console.WriteLine($"No se pudo crear RolePermission para PermissionId: {permissionId} - probablemente fue creado por otra operación");
                                    }
                                }
                                catch (PostgresException pgEx) when (pgEx.SqlState == "23505")
                                {
                                    // Error de clave duplicada - probablemente la secuencia de IDs está desincronizada
                                    Console.WriteLine($"ERROR: Clave duplicada al crear RolePermission para PermissionId: {permissionId}");
                                    Console.WriteLine($"Intentando resetear la secuencia de IDs...");
                                    
                                    try
                                    {
                                        // Resetear la secuencia de IDs para RolePermissions
                                        var maxId = await _context.Database
                                            .ExecuteSqlRawAsync("SELECT COALESCE(MAX(\"Id\"), 0) FROM \"RolePermissions\"");
                                        
                                        await _context.Database.ExecuteSqlRawAsync(
                                            $"SELECT setval('\"RolePermissions_Id_seq\"', {maxId}, true)");
                                        
                                        Console.WriteLine($"Secuencia de IDs reseteada. Reintentando inserción...");
                                        
                                        // Reintentar la inserción
                                        var sqlInsertRetry = @"
                                            INSERT INTO ""RolePermissions"" 
                                            (""RoleId"", ""PermissionId"", ""IsGranted"", ""GrantedAt"", ""GrantedBy"", ""Activo"", ""FechaCreacion"", ""UsuarioCreacion"", ""UsuarioUpdate"")
                                            SELECT {0}, {1}, true, {2}, 1, true, {2}, 'system', 'system'
                                            WHERE NOT EXISTS (
                                                SELECT 1 FROM ""RolePermissions"" 
                                                WHERE ""RoleId"" = {0} AND ""PermissionId"" = {1}
                                            )";
                                        
                                        var rowsAffectedRetry = await _context.Database.ExecuteSqlRawAsync(
                                            sqlInsertRetry, id, permissionId, now);
                                        
                                        if (rowsAffectedRetry > 0)
                                        {
                                            Console.WriteLine($"RolePermission creado exitosamente después de resetear secuencia para PermissionId: {permissionId}");
                                        }
                                    }
                                    catch (Exception resetEx)
                                    {
                                        Console.WriteLine($"ERROR al resetear secuencia: {resetEx.Message}");
                                        // Si no se puede resetear, simplemente saltar este permiso
                                        Console.WriteLine($"Saltando PermissionId {permissionId} debido a error de secuencia");
                                    }
                                }
                            }
                        }

                        // Limpiar el ChangeTracker de entidades no relacionadas con este rol
                        // Esto evita conflictos cuando hay muchas entidades trackeadas
                        var unrelatedEntries = _context.ChangeTracker.Entries<RolePermission>()
                            .Where(e => e.Entity.RoleId != id)
                            .ToList();
                        
                        foreach (var entry in unrelatedEntries)
                        {
                            entry.State = Microsoft.EntityFrameworkCore.EntityState.Detached;
                        }
                        
                        if (unrelatedEntries.Count > 0)
                        {
                            Console.WriteLine($"Desvinculadas {unrelatedEntries.Count} entidades RolePermission no relacionadas con el rol {id}");
                        }
                        
                        // Verificar el estado del ChangeTracker antes de guardar
                        var trackedRolePermissions = _context.ChangeTracker.Entries<RolePermission>()
                            .Where(e => e.State != Microsoft.EntityFrameworkCore.EntityState.Unchanged && e.State != Microsoft.EntityFrameworkCore.EntityState.Detached)
                            .ToList();
                        
                        Console.WriteLine($"=== ESTADO DEL CHANGETRACKER ANTES DE GUARDAR ===");
                        Console.WriteLine($"Total de RolePermissions trackeados con cambios: {trackedRolePermissions.Count}");
                        foreach (var entry in trackedRolePermissions)
                        {
                            Console.WriteLine($"  - ID: {entry.Entity.Id}, RoleId: {entry.Entity.RoleId}, PermissionId: {entry.Entity.PermissionId}, Estado: {entry.State}, Activo: {entry.Entity.Activo}");
                        }
                        Console.WriteLine($"================================================");
                        
                        // Guardar todos los cambios restantes
                        var saved = await _context.SaveChangesAsync();
                        Console.WriteLine($"Cambios finales guardados: {saved} entidades afectadas");
                        
                        await transaction.CommitAsync();
                        Console.WriteLine("Transacción completada exitosamente");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"ERROR en transacción: {ex.Message}");
                        Console.WriteLine($"StackTrace: {ex.StackTrace}");
                        await transaction.RollbackAsync();
                        throw; // Re-lanzar para que el catch externo lo maneje
                    }
                }
                else
                {
                    Console.WriteLine("No se enviaron PermissionIds en el request");
                }

                Console.WriteLine($"=== FIN UPDATE ROLE (EXITOSO) ===");
                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                Console.WriteLine($"=== ERROR DE BASE DE DATOS EN UPDATE ROLE ===");
                Console.WriteLine($"Mensaje: {dbEx.Message}");
                Console.WriteLine($"InnerException: {dbEx.InnerException?.Message}");
                if (dbEx.InnerException != null)
                {
                    Console.WriteLine($"InnerException StackTrace: {dbEx.InnerException.StackTrace}");
                }
                Console.WriteLine($"StackTrace: {dbEx.StackTrace}");
                return StatusCode(500, new { 
                    message = "Error de base de datos al actualizar rol", 
                    error = dbEx.Message,
                    details = dbEx.InnerException?.Message 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ERROR GENERAL EN UPDATE ROLE ===");
                Console.WriteLine($"Tipo: {ex.GetType().Name}");
                Console.WriteLine($"Mensaje: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                    Console.WriteLine($"InnerException StackTrace: {ex.InnerException.StackTrace}");
                }
                return StatusCode(500, new { 
                    message = "Error interno del servidor al actualizar rol", 
                    error = ex.Message,
                    details = ex.InnerException?.Message 
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = await _repository.GetByIdAsync(id);
            if (role == null) return NotFound();
            await _repository.DeleteAsync(role);
            return NoContent();
        }
    }

    // DTO para actualizar roles
    public class UpdateRoleRequest
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsSystem { get; set; }
        public int? Priority { get; set; }
        public bool? Activo { get; set; }
        public List<int>? PermissionIds { get; set; }
    }
} 