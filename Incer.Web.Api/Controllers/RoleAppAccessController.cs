using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Incer.Web.Core.Entities;
using Incer.Web.Api.Attributes;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoleAppAccessController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public RoleAppAccessController(ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor) 
            : base(permissionService, httpContextAccessor)
        {
            _context = context;
        }

        // GET: api/roleappaccess/role/{roleId}
        [HttpGet("role/{roleId}")]
        [RequirePermission("role_app_access", "read")]
        public async Task<ActionResult<IEnumerable<object>>> GetRoleAppAccesses(int roleId)
        {
            var accesses = await _context.RoleAppAccesses
                .Include(raa => raa.Application)
                .Where(raa => raa.RoleId == roleId && raa.Active)
                .Select(raa => new
                {
                    id = raa.Id,
                    roleId = raa.RoleId,
                    appId = raa.AppId,
                    appName = raa.Application.Name,
                    appCode = raa.Application.Code,
                    appType = raa.Application.Type,
                    accessLevel = raa.AccessLevel,
                    grantedAt = raa.GrantedAt,
                    expiresAt = raa.ExpiresAt,
                    active = raa.Active
                })
                .ToListAsync();

            return Ok(accesses);
        }

        // GET: api/roleappaccess/app/{appId}
        [HttpGet("app/{appId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAppRoleAccesses(int appId)
        {
            var accesses = await _context.RoleAppAccesses
                .Include(raa => raa.Role)
                .Where(raa => raa.AppId == appId && raa.Active)
                .Select(raa => new
                {
                    id = raa.Id,
                    roleId = raa.RoleId,
                    roleName = raa.Role.Name,
                    roleDescription = raa.Role.Description,
                    appId = raa.AppId,
                    accessLevel = raa.AccessLevel,
                    grantedAt = raa.GrantedAt,
                    expiresAt = raa.ExpiresAt,
                    active = raa.Active
                })
                .ToListAsync();

            return Ok(accesses);
        }

        // POST: api/roleappaccess
        [HttpPost]
        [RequirePermission("role_app_access", "create")]
        public async Task<ActionResult<RoleAppAccess>> CreateRoleAppAccess([FromBody] CreateRoleAppAccessRequest request)
        {
            // Verificar que el rol existe
            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null)
                return NotFound("Rol no encontrado");

            // Verificar que la aplicación existe
            var app = await _context.Applications.FindAsync(request.AppId);
            if (app == null)
                return NotFound("Aplicación no encontrada");

            // Verificar que no existe ya el acceso
            var existingAccess = await _context.RoleAppAccesses
                .FirstOrDefaultAsync(raa => raa.RoleId == request.RoleId && raa.AppId == request.AppId);
            
            if (existingAccess != null)
            {
                if (existingAccess.Active)
                    return Conflict("El rol ya tiene acceso a esta aplicación");
                else
                {
                    // Reactivar acceso existente
                    existingAccess.Active = true;
                    existingAccess.AccessLevel = request.AccessLevel;
                    existingAccess.GrantedAt = DateTime.UtcNow;
                    existingAccess.ExpiresAt = request.ExpiresAt;
                    existingAccess.GrantedBy = GetCurrentUserId() ?? 1;
                    existingAccess.UsuarioUpdate = "system";
                    await _context.SaveChangesAsync();
                    return Ok(existingAccess);
                }
            }

            var roleAppAccess = new RoleAppAccess
            {
                RoleId = request.RoleId,
                AppId = request.AppId,
                AccessLevel = request.AccessLevel,
                GrantedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt,
                GrantedBy = GetCurrentUserId() ?? 1,
                Active = true,
                UsuarioCreacion = "system",
                UsuarioUpdate = "system"
            };

            _context.RoleAppAccesses.Add(roleAppAccess);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoleAppAccess), new { id = roleAppAccess.Id }, roleAppAccess);
        }

        // GET: api/roleappaccess/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RoleAppAccess>> GetRoleAppAccess(int id)
        {
            var roleAppAccess = await _context.RoleAppAccesses
                .Include(raa => raa.Role)
                .Include(raa => raa.Application)
                .FirstOrDefaultAsync(raa => raa.Id == id);

            if (roleAppAccess == null)
                return NotFound();

            return Ok(roleAppAccess);
        }

        // PUT: api/roleappaccess/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoleAppAccess(int id, [FromBody] UpdateRoleAppAccessRequest request)
        {
            var roleAppAccess = await _context.RoleAppAccesses.FindAsync(id);
            if (roleAppAccess == null)
                return NotFound();

            roleAppAccess.AccessLevel = request.AccessLevel;
            roleAppAccess.ExpiresAt = request.ExpiresAt;
            roleAppAccess.Active = request.Active;
            roleAppAccess.UsuarioUpdate = "system";

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/roleappaccess/{id}
        [HttpDelete("{id}")]
        [RequirePermission("role_app_access", "delete")]
        public async Task<IActionResult> DeleteRoleAppAccess(int id)
        {
            var roleAppAccess = await _context.RoleAppAccesses.FindAsync(id);
            if (roleAppAccess == null)
                return NotFound();

            // Soft delete
            roleAppAccess.Active = false;
            roleAppAccess.UsuarioUpdate = "system";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/roleappaccess/bulk-assign
        [HttpPost("bulk-assign")]
        public async Task<ActionResult> BulkAssignAppsToRole([FromBody] BulkAssignAppsToRoleRequest request)
        {
            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null)
                return NotFound("Rol no encontrado");

            var apps = await _context.Applications
                .Where(app => request.AppIds.Contains(app.Id) && app.Active)
                .ToListAsync();

            if (apps.Count != request.AppIds.Count)
                return BadRequest("Una o más aplicaciones no existen o están inactivas");

            var existingAccesses = await _context.RoleAppAccesses
                .Where(raa => raa.RoleId == request.RoleId && request.AppIds.Contains(raa.AppId))
                .ToListAsync();

            var newAccesses = new List<RoleAppAccess>();
            var updatedAccesses = new List<RoleAppAccess>();

            foreach (var appId in request.AppIds)
            {
                var existingAccess = existingAccesses.FirstOrDefault(raa => raa.AppId == appId);
                
                if (existingAccess == null)
                {
                    // Crear nuevo acceso
                    newAccesses.Add(new RoleAppAccess
                    {
                        RoleId = request.RoleId,
                        AppId = appId,
                        AccessLevel = request.AccessLevel,
                        GrantedAt = DateTime.UtcNow,
                        ExpiresAt = request.ExpiresAt,
                        GrantedBy = GetCurrentUserId() ?? 1,
                        Active = true,
                        UsuarioCreacion = "system",
                        UsuarioUpdate = "system"
                    });
                }
                else if (!existingAccess.Active)
                {
                    // Reactivar acceso existente
                    existingAccess.Active = true;
                    existingAccess.AccessLevel = request.AccessLevel;
                    existingAccess.GrantedAt = DateTime.UtcNow;
                    existingAccess.ExpiresAt = request.ExpiresAt;
                    existingAccess.GrantedBy = GetCurrentUserId() ?? 1;
                    existingAccess.UsuarioUpdate = "system";
                    updatedAccesses.Add(existingAccess);
                }
            }

            if (newAccesses.Any())
            {
                _context.RoleAppAccesses.AddRange(newAccesses);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Accesos asignados exitosamente",
                newAccesses = newAccesses.Count,
                updatedAccesses = updatedAccesses.Count
            });
        }
    }

    public class CreateRoleAppAccessRequest
    {
        public int RoleId { get; set; }
        public int AppId { get; set; }
        public string AccessLevel { get; set; } = "limited"; // 'full', 'limited', 'readonly'
        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdateRoleAppAccessRequest
    {
        public string AccessLevel { get; set; } = "limited";
        public DateTime? ExpiresAt { get; set; }
        public bool Active { get; set; } = true;
    }

    public class BulkAssignAppsToRoleRequest
    {
        public int RoleId { get; set; }
        public List<int> AppIds { get; set; } = new();
        public string AccessLevel { get; set; } = "limited";
        public DateTime? ExpiresAt { get; set; }
    }
}
