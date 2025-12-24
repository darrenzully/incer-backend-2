using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using System.Security.Claims;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserAccessController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public UserAccessController(ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor) 
            : base(permissionService, httpContextAccessor)
        {
            _context = context;
        }

        // GET: api/useraccess/my-apps
        [HttpGet("my-apps")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyApps()
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized("Usuario no autenticado");

            // Obtener aplicaciones accesibles del usuario
            var accessibleAppIds = await _permissionService.GetCurrentUserAccessibleAppsAsync();
            
            var apps = await _context.Applications
                .Where(app => accessibleAppIds.Contains(app.Id) && app.Active)
                .Select(app => new
                {
                    id = app.Id,
                    name = app.Name,
                    code = app.Code,
                    type = app.Type,
                    platform = app.Platform,
                    version = app.Version,
                    // Obtener nivel de acceso del usuario
                    accessLevel = _context.UserAppAccesses
                        .Where(uaa => uaa.UserId == currentUserId.Value && uaa.AppId == app.Id && uaa.Active)
                        .Select(uaa => uaa.AccessLevel)
                        .FirstOrDefault() ?? "limited"
                })
                .ToListAsync();

            return Ok(apps);
        }

        // GET: api/useraccess/my-permissions
        [HttpGet("my-permissions")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyPermissions([FromQuery] int? appId = null)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized("Usuario no autenticado");

            var permissions = await _permissionService.GetCurrentUserPermissionsAsync(appId);
            
            var permissionList = permissions.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                description = p.Description,
                resource = p.Resource,
                action = p.Action,
                scope = p.Scope,
                isSystem = p.IsSystem
            }).ToList();

            return Ok(permissionList);
        }

        // GET: api/useraccess/my-centers
        [HttpGet("my-centers")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyCenters([FromQuery] int? appId = null)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized("Usuario no autenticado");

            var accessibleCenterIds = await _permissionService.GetCurrentUserAccessibleCentersAsync(appId);
            
            var centers = await _context.Sucursales
                .Include(s => s.Cliente)
                .Include(s => s.Localidad)
                .ThenInclude(l => l.Provincia)
                .Where(s => accessibleCenterIds.Contains(s.Id) && s.Activo)
                .Select(s => new
                {
                    id = s.Id,
                    nombre = s.Nombre,
                    direccion = s.Direccion,
                    telefono = s.Telefono,
                    cliente = new
                    {
                        id = s.Cliente.Id,
                        nombre = s.Cliente.Nombre
                    },
                    localidad = new
                    {
                        id = s.Localidad.Id,
                        nombre = s.Localidad.Nombre,
                        provincia = s.Localidad.Provincia.Nombre
                    },
                    activo = s.Activo
                })
                .ToListAsync();

            return Ok(centers);
        }

        // GET: api/useraccess/check-permission
        [HttpGet("check-permission")]
        public async Task<ActionResult<object>> CheckPermission(
            [FromQuery] string resource, 
            [FromQuery] string action, 
            [FromQuery] int? centerId = null, 
            [FromQuery] int? appId = null)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue)
                return Unauthorized("Usuario no autenticado");

            var hasPermission = await _permissionService.CheckPermissionAsync(
                currentUserId.Value, 
                resource, 
                action, 
                centerId, 
                appId);

            return Ok(new
            {
                hasPermission,
                resource,
                action,
                centerId,
                appId,
                userId = currentUserId.Value
            });
        }

        // GET: api/useraccess/user/{userId}/apps
        [HttpGet("user/{userId}/apps")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserApps(int userId)
        {
            // Verificar que el usuario actual tiene permisos para ver otros usuarios
            var canViewUsers = await _permissionService.CheckPermissionAsync("users", "read");
            if (!canViewUsers)
                return Forbid("No tienes permisos para ver otros usuarios");

            var accessibleAppIds = await _permissionService.GetUserAccessibleAppsAsync(userId);
            
            var apps = await _context.Applications
                .Where(app => accessibleAppIds.Contains(app.Id) && app.Active)
                .Select(app => new
                {
                    id = app.Id,
                    name = app.Name,
                    code = app.Code,
                    type = app.Type,
                    platform = app.Platform,
                    version = app.Version,
                    accessLevel = _context.UserAppAccesses
                        .Where(uaa => uaa.UserId == userId && uaa.AppId == app.Id && uaa.Active)
                        .Select(uaa => uaa.AccessLevel)
                        .FirstOrDefault() ?? "limited"
                })
                .ToListAsync();

            return Ok(apps);
        }

        // GET: api/useraccess/role/{roleId}/apps
        [HttpGet("role/{roleId}/apps")]
        public async Task<ActionResult<IEnumerable<object>>> GetRoleApps(int roleId)
        {
            // Verificar que el usuario actual tiene permisos para ver roles
            var canViewRoles = await _permissionService.CheckPermissionAsync("roles", "read");
            if (!canViewRoles)
                return Forbid("No tienes permisos para ver roles");

            var roleAppAccesses = await _context.RoleAppAccesses
                .Include(raa => raa.Application)
                .Where(raa => raa.RoleId == roleId && raa.Active)
                .Select(raa => new
                {
                    id = raa.Application.Id,
                    name = raa.Application.Name,
                    code = raa.Application.Code,
                    type = raa.Application.Type,
                    platform = raa.Application.Platform,
                    version = raa.Application.Version,
                    accessLevel = raa.AccessLevel
                })
                .ToListAsync();

            return Ok(roleAppAccesses);
        }
    }
}
