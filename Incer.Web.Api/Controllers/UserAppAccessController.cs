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
    public class UserAppAccessController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public UserAppAccessController(ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor) 
            : base(permissionService, httpContextAccessor)
        {
            _context = context;
        }

        // GET: api/userappaccess/user/{userId}
        [HttpGet("user/{userId}")]
        [RequirePermission("user_app_access", "read")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserAppAccesses(int userId)
        {
            var accesses = await _context.UserAppAccesses
                .Include(uaa => uaa.Application)
                .Where(uaa => uaa.UserId == userId && uaa.Active)
                .Select(uaa => new
                {
                    id = uaa.Id,
                    userId = uaa.UserId,
                    appId = uaa.AppId,
                    appName = uaa.Application.Name,
                    appCode = uaa.Application.Code,
                    appType = uaa.Application.Type,
                    accessLevel = uaa.AccessLevel,
                    grantedAt = uaa.GrantedAt,
                    expiresAt = uaa.ExpiresAt,
                    active = uaa.Active
                })
                .ToListAsync();

            return Ok(accesses);
        }

        // GET: api/userappaccess/app/{appId}
        [HttpGet("app/{appId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAppUserAccesses(int appId)
        {
            var accesses = await _context.UserAppAccesses
                .Include(uaa => uaa.User)
                .Where(uaa => uaa.AppId == appId && uaa.Active)
                .Select(uaa => new
                {
                    id = uaa.Id,
                    userId = uaa.UserId,
                    userName = $"{uaa.User.Apellido}, {uaa.User.Nombre}",
                    userEmail = uaa.User.Mail,
                    appId = uaa.AppId,
                    accessLevel = uaa.AccessLevel,
                    grantedAt = uaa.GrantedAt,
                    expiresAt = uaa.ExpiresAt,
                    active = uaa.Active
                })
                .ToListAsync();

            return Ok(accesses);
        }

        // POST: api/userappaccess
        [HttpPost]
        [RequirePermission("user_app_access", "create")]
        public async Task<ActionResult<UserAppAccess>> CreateUserAppAccess([FromBody] CreateUserAppAccessRequest request)
        {
            // Verificar que el usuario existe
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound("Usuario no encontrado");

            // Verificar que la aplicación existe
            var app = await _context.Applications.FindAsync(request.AppId);
            if (app == null)
                return NotFound("Aplicación no encontrada");

            // Verificar que no existe ya el acceso
            var existingAccess = await _context.UserAppAccesses
                .FirstOrDefaultAsync(uaa => uaa.UserId == request.UserId && uaa.AppId == request.AppId);
            
            if (existingAccess != null)
            {
                if (existingAccess.Active)
                    return Conflict("El usuario ya tiene acceso a esta aplicación");
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

            var userAppAccess = new UserAppAccess
            {
                UserId = request.UserId,
                AppId = request.AppId,
                AccessLevel = request.AccessLevel,
                GrantedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt,
                GrantedBy = GetCurrentUserId() ?? 1,
                Active = true,
                UsuarioCreacion = "system",
                UsuarioUpdate = "system"
            };

            _context.UserAppAccesses.Add(userAppAccess);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserAppAccess), new { id = userAppAccess.Id }, userAppAccess);
        }

        // GET: api/userappaccess/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<UserAppAccess>> GetUserAppAccess(int id)
        {
            var userAppAccess = await _context.UserAppAccesses
                .Include(uaa => uaa.User)
                .Include(uaa => uaa.Application)
                .FirstOrDefaultAsync(uaa => uaa.Id == id);

            if (userAppAccess == null)
                return NotFound();

            return Ok(userAppAccess);
        }

        // PUT: api/userappaccess/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserAppAccess(int id, [FromBody] UpdateUserAppAccessRequest request)
        {
            var userAppAccess = await _context.UserAppAccesses.FindAsync(id);
            if (userAppAccess == null)
                return NotFound();

            userAppAccess.AccessLevel = request.AccessLevel;
            userAppAccess.ExpiresAt = request.ExpiresAt;
            userAppAccess.Active = request.Active;
            userAppAccess.UsuarioUpdate = "system";

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/userappaccess/{id}
        [HttpDelete("{id}")]
        [RequirePermission("user_app_access", "delete")]
        public async Task<IActionResult> DeleteUserAppAccess(int id)
        {
            var userAppAccess = await _context.UserAppAccesses.FindAsync(id);
            if (userAppAccess == null)
                return NotFound();

            // Soft delete
            userAppAccess.Active = false;
            userAppAccess.UsuarioUpdate = "system";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/userappaccess/available-apps
        [HttpGet("available-apps")]
        public async Task<ActionResult<IEnumerable<object>>> GetAvailableApps()
        {
            var apps = await _context.Applications
                .Where(app => app.Active)
                .Select(app => new
                {
                    id = app.Id,
                    name = app.Name,
                    code = app.Code,
                    type = app.Type,
                    platform = app.Platform,
                    version = app.Version
                })
                .ToListAsync();

            return Ok(apps);
        }
    }

    public class CreateUserAppAccessRequest
    {
        public int UserId { get; set; }
        public int AppId { get; set; }
        public string AccessLevel { get; set; } = "limited"; // 'full', 'limited', 'readonly'
        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdateUserAppAccessRequest
    {
        public string AccessLevel { get; set; } = "limited";
        public DateTime? ExpiresAt { get; set; }
        public bool Active { get; set; } = true;
    }
}
