using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public PermissionService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        
        // Obtener el ID del usuario del contexto JWT
        private int? GetCurrentUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out var userId))
                {
                    return userId;
                }
            }
            return null;
        }
        
        // Obtener la aplicación del contexto JWT
        private int? GetCurrentAppId()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated == true)
            {
                var appIdClaim = user.FindFirst("DefaultApp")?.Value;
                if (int.TryParse(appIdClaim, out var appId))
                {
                    return appId;
                }
            }
            return null;
        }
        
        public async Task<bool> CheckPermissionAsync(int userId, string resource, string action, int? centerId = null, int? appId = null)
        {
            Console.WriteLine($"=== CheckPermissionAsync ===");
            Console.WriteLine($"userId: {userId}, resource: {resource}, action: {action}, centerId: {centerId}, appId: {appId}");
            
            // Si no se especifica app, usar la app del contexto JWT
            if (!appId.HasValue)
            {
                appId = GetCurrentAppId();
                if (!appId.HasValue)
                {
                    var defaultApp = await GetUserDefaultAppAsync(userId);
                    if (defaultApp == null)
                    {
                        Console.WriteLine($"No se encontró app por defecto para usuario {userId}");
                        return false;
                    }
                    appId = defaultApp;
                }
            }
            
            Console.WriteLine($"AppId final: {appId.Value}");
            
            // Verificar acceso a la app
            if (!await CanAccessAppAsync(userId, appId.Value))
            {
                Console.WriteLine($"Usuario {userId} no tiene acceso a app {appId.Value}");
                return false;
            }
            
            // Verificar permisos globales para la app
            var hasGlobalPermission = await HasGlobalPermissionAsync(userId, resource, action, appId.Value);
            if (hasGlobalPermission)
            {
                Console.WriteLine($"Usuario {userId} tiene permiso global para {action} en {resource}");
                return true;
            }
            
            // Si se especifica centro, verificar acceso al centro en la app
            if (centerId.HasValue)
            {
                Console.WriteLine($"Verificando acceso al centro {centerId.Value}");
                var canAccessCenter = await CanAccessCenterInAppAsync(userId, centerId.Value, appId.Value);
                if (!canAccessCenter)
                {
                    Console.WriteLine($"Usuario {userId} no tiene acceso al centro {centerId.Value} en app {appId.Value}");
                    return false;
                }
                var hasCenterPermission = await HasCenterPermissionAsync(userId, centerId.Value, resource, action, appId.Value);
                Console.WriteLine($"Usuario {userId} tiene permiso para {action} en {resource} en centro {centerId.Value}: {hasCenterPermission}");
                return hasCenterPermission;
            }
            
            // Verificar permisos del centro por defecto del usuario
            var defaultCenter = await GetUserDefaultCenterInAppAsync(userId, appId.Value);
            if (defaultCenter == null)
            {
                Console.WriteLine($"Usuario {userId} no tiene centro por defecto en app {appId.Value}, verificando permisos globales");
                // Si no tiene centro, verificar si tiene permisos globales
                return await HasGlobalPermissionAsync(userId, resource, action, appId.Value);
            }
            
            Console.WriteLine($"Centro por defecto: {defaultCenter.Value}");
            var hasPermission = await HasCenterPermissionAsync(userId, defaultCenter.Value, resource, action, appId.Value);
            Console.WriteLine($"Usuario {userId} tiene permiso para {action} en {resource} en centro {defaultCenter.Value}: {hasPermission}");
            return hasPermission;
        }
        
        // Sobrecarga para usar el usuario actual del contexto JWT
        public async Task<bool> CheckPermissionAsync(string resource, string action, int? centerId = null, int? appId = null)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue) return false;
            
            return await CheckPermissionAsync(currentUserId.Value, resource, action, centerId, appId);
        }
        
        // Obtener permisos del usuario actual
        public async Task<IEnumerable<Permission>> GetCurrentUserPermissionsAsync(int? appId = null)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue) return Enumerable.Empty<Permission>();
            
            return await GetUserPermissionsAsync(currentUserId.Value, appId);
        }
        
        // Obtener centros accesibles del usuario actual
        public async Task<IEnumerable<int>> GetCurrentUserAccessibleCentersAsync(int? appId = null)
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue) return Enumerable.Empty<int>();
            
            return await GetUserAccessibleCentersAsync(currentUserId.Value, appId);
        }
        
        // Obtener aplicaciones accesibles del usuario actual
        public async Task<IEnumerable<int>> GetCurrentUserAccessibleAppsAsync()
        {
            var currentUserId = GetCurrentUserId();
            if (!currentUserId.HasValue) return Enumerable.Empty<int>();
            
            return await GetUserAccessibleAppsAsync(currentUserId.Value);
        }
        
        public async Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId, int? appId = null)
        {
            Console.WriteLine($"GetUserPermissionsAsync - userId: {userId}, appId: {appId}");

            // Importante: evitar depender de navegación Role.Users (hay warnings de EF por shadow properties),
            // y resolver permisos por RoleId directo del usuario.
            var roleId = await _context.Users
                .Where(u => u.Id == userId && u.Activo)
                .Select(u => (int?)u.RoleId)
                .FirstOrDefaultAsync();

            if (!roleId.HasValue || roleId.Value <= 0)
            {
                Console.WriteLine($"GetUserPermissionsAsync - No se encontró RoleId válido para userId {userId}");
                return Enumerable.Empty<Permission>();
            }

            var rpQuery = _context.RolePermissions
                .AsNoTracking()
                .Include(rp => rp.Permission)
                .Where(rp =>
                    rp.RoleId == roleId.Value &&
                    rp.Activo &&
                    rp.IsGranted &&
                    rp.Permission != null &&
                    rp.Permission.Activo);

            // Solo filtrar por aplicación si se especifica un appId
            if (appId.HasValue)
            {
                rpQuery = rpQuery.Where(rp => rp.Permission!.AppPermissions.Any(ap => ap.AppId == appId.Value && ap.Active));
            }

            var permissions = await rpQuery
                .Select(rp => rp.Permission!)
                .Distinct()
                .ToListAsync();

            Console.WriteLine($"GetUserPermissionsAsync - Found {permissions.Count} permissions for user {userId} (roleId={roleId.Value})");
            return permissions;
        }
        
        public async Task<IEnumerable<int>> GetUserAccessibleCentersAsync(int userId, int? appId = null)
        {
            Console.WriteLine($"GetUserAccessibleCentersAsync - userId: {userId}, appId: {appId} (ignorado - permisos son los mismos para todas las apps)");
            
            // Obtener appId solo para verificar permisos globales (si no se proporciona, usar la primera app del usuario)
            // Pero los permisos son los mismos para todas las apps, así que usamos cualquier appId disponible
            int appIdForPermissions = appId ?? await GetUserDefaultAppAsync(userId) ?? 0;
            
            // Verificar permisos globales (los permisos son los mismos para todas las apps)
            var hasGlobalPermission = await HasGlobalPermissionAsync(userId, "*", "*", appIdForPermissions);
            
            if (hasGlobalPermission)
            {
                Console.WriteLine($"GetUserAccessibleCentersAsync - Usuario {userId} tiene permisos globales, retornando todos los BusinessCenters");
                var allCenters = await _context.BusinessCenters
                    .Where(bc => bc.Activo)
                    .Select(bc => bc.Id)
                    .ToListAsync();
                Console.WriteLine($"GetUserAccessibleCentersAsync - Total BusinessCenters encontrados: {allCenters.Count}");
                return allCenters;
            }
            
            // Retornar centros asignados al usuario (SIN filtrar por appId - los permisos son los mismos para todas las apps)
            var accessibleCenters = await _context.UserCenterAppAccesses
                .Where(ucaa => ucaa.UserId == userId && 
                              ucaa.Active &&
                              (ucaa.ExpiresAt == null || ucaa.ExpiresAt > DateTime.UtcNow))
                .Select(ucaa => ucaa.BusinessCenterId)
                .Distinct()
                .ToListAsync();
            
            Console.WriteLine($"GetUserAccessibleCentersAsync - Centros accesibles para usuario {userId} (sin filtrar por app): {accessibleCenters.Count}");
            return accessibleCenters;
        }
        
        public async Task<IEnumerable<int>> GetUserAccessibleAppsAsync(int userId)
        {
            return await _context.UserAppAccesses
                .Where(uaa => uaa.UserId == userId && 
                             uaa.Active &&
                             (uaa.ExpiresAt == null || uaa.ExpiresAt > DateTime.UtcNow))
                .Select(uaa => uaa.AppId)
                .ToListAsync();
        }
        
        public async Task<bool> CanAccessAppAsync(int userId, int appId)
        {
            return await _context.UserAppAccesses
                .AnyAsync(uaa => uaa.UserId == userId && 
                               uaa.AppId == appId && 
                               uaa.Active &&
                               (uaa.ExpiresAt == null || uaa.ExpiresAt > DateTime.UtcNow));
        }
        
        public async Task<bool> CanAccessCenterInAppAsync(int userId, int businessCenterId, int appId)
        {
            return await _context.UserCenterAppAccesses
                .AnyAsync(ucaa => ucaa.UserId == userId && 
                                 ucaa.BusinessCenterId == businessCenterId && 
                                 ucaa.AppId == appId && 
                                 ucaa.Active &&
                                 (ucaa.ExpiresAt == null || ucaa.ExpiresAt > DateTime.UtcNow));
        }

        
        private async Task<int?> GetUserDefaultAppAsync(int userId)
        {
            var appAccess = await _context.UserAppAccesses
                .Where(uaa => uaa.UserId == userId && uaa.Active)
                .FirstOrDefaultAsync();
            
            return appAccess?.AppId;
        }
        
        private async Task<int?> GetUserDefaultCenterInAppAsync(int userId, int appId)
        {
            var centerAccess = await _context.UserCenterAppAccesses
                .Where(ucaa => ucaa.UserId == userId && 
                              ucaa.AppId == appId && 
                              ucaa.IsDefault && 
                              ucaa.Active)
                .FirstOrDefaultAsync();
            
            return centerAccess?.BusinessCenterId;
        }
        
        private async Task<bool> HasGlobalPermissionAsync(int userId, string resource, string action, int appId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                .ThenInclude(rp => rp!.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user?.Role == null)
            {
                Console.WriteLine($"HasGlobalPermissionAsync - Usuario {userId} no encontrado o sin rol");
                return false;
            }
            
            Console.WriteLine($"HasGlobalPermissionAsync - Usuario {userId}, Rol: {user.Role.Name}, Total RolePermissions: {user.Role.RolePermissions.Count}");
            Console.WriteLine($"HasGlobalPermissionAsync - Buscando: resource='{resource}', action='{action}', scope='global' o 'center'");
            
            // Log de todos los permisos activos del rol para debugging
            var allActivePermissions = user.Role.RolePermissions
                .Where(rp => rp.Activo && rp.Permission != null && rp.Permission.Activo)
                .ToList();
            Console.WriteLine($"HasGlobalPermissionAsync - Permisos activos del rol: {allActivePermissions.Count}");
            foreach (var rp in allActivePermissions)
            {
                Console.WriteLine($"  - PermissionId: {rp.PermissionId}, Resource: '{rp.Permission?.Resource}', Action: '{rp.Permission?.Action}', Scope: '{rp.Permission?.Scope}', IsGranted: {rp.IsGranted}");
            }
            
            // Verificar si el usuario tiene permiso de "Acceso Global" (Admin)
            var hasGlobalAccess = user.Role.RolePermissions.Any(rp => 
                rp.IsGranted && 
                rp.Activo &&
                rp.Permission != null &&
                rp.Permission.Activo &&
                rp.Permission.Resource == "*" && 
                rp.Permission.Action == "*" &&
                rp.Permission.Scope == "global");
            
            if (hasGlobalAccess)
            {
                Console.WriteLine($"HasGlobalPermissionAsync - Usuario {userId} tiene acceso global");
                return true;
            }
            
            // Verificar permisos específicos del rol (comparación case-insensitive)
            // Aceptar permisos con scope "global" o "center" (los permisos de centro también aplican globalmente si no hay centro específico)
            var matchingPermissions = user.Role.RolePermissions.Where(rp => 
                rp.IsGranted && 
                rp.Activo &&
                rp.Permission != null &&
                rp.Permission.Activo &&
                string.Equals(rp.Permission.Resource, resource, StringComparison.OrdinalIgnoreCase) && 
                string.Equals(rp.Permission.Action, action, StringComparison.OrdinalIgnoreCase) &&
                (string.Equals(rp.Permission.Scope, "global", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(rp.Permission.Scope, "center", StringComparison.OrdinalIgnoreCase))).ToList();
            
            Console.WriteLine($"HasGlobalPermissionAsync - Permisos encontrados para {resource}/{action}: {matchingPermissions.Count}");
            foreach (var rp in matchingPermissions)
            {
                Console.WriteLine($"  - PermissionId: {rp.PermissionId}, Resource: '{rp.Permission?.Resource}', Action: '{rp.Permission?.Action}', Scope: '{rp.Permission?.Scope}', IsGranted: {rp.IsGranted}, Activo: {rp.Activo}, Permission.Activo: {rp.Permission?.Activo}");
            }
            
            return matchingPermissions.Any();
        }
        
        private async Task<bool> HasCenterPermissionAsync(int userId, int centerId, string resource, string action, int appId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .ThenInclude(r => r!.RolePermissions)
                .ThenInclude(rp => rp!.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user?.Role == null)
            {
                Console.WriteLine($"HasCenterPermissionAsync - Usuario {userId} no encontrado o sin rol");
                return false;
            }
            
            Console.WriteLine($"HasCenterPermissionAsync - Usuario {userId}, Rol: {user.Role.Name}, Centro: {centerId}, Resource: {resource}, Action: {action}");
            
            // Verificar si el usuario tiene permiso de "Acceso Global" (Admin)
            var hasGlobalAccess = user.Role.RolePermissions.Any(rp => 
                rp.IsGranted && 
                rp.Activo &&
                rp.Permission != null &&
                rp.Permission.Activo &&
                rp.Permission.Resource == "*" && 
                rp.Permission.Action == "*" &&
                rp.Permission.Scope == "global");
            
            if (hasGlobalAccess)
            {
                Console.WriteLine($"HasCenterPermissionAsync - Usuario {userId} tiene acceso global");
                return true;
            }
            
            // Verificar permisos específicos del rol para el centro específico (comparación case-insensitive)
            var matchingPermissions = user.Role.RolePermissions.Where(rp => 
                rp.IsGranted && 
                rp.Activo &&
                rp.Permission != null &&
                rp.Permission.Activo &&
                string.Equals(rp.Permission.Resource, resource, StringComparison.OrdinalIgnoreCase) && 
                string.Equals(rp.Permission.Action, action, StringComparison.OrdinalIgnoreCase) &&
                (string.Equals(rp.Permission.Scope, "center", StringComparison.OrdinalIgnoreCase) || 
                 string.Equals(rp.Permission.Scope, "global", StringComparison.OrdinalIgnoreCase))).ToList();
            
            Console.WriteLine($"HasCenterPermissionAsync - Permisos encontrados para {resource}/{action} en centro {centerId}: {matchingPermissions.Count}");
            foreach (var rp in matchingPermissions)
            {
                Console.WriteLine($"  - PermissionId: {rp.PermissionId}, Resource: '{rp.Permission?.Resource}', Action: '{rp.Permission?.Action}', Scope: '{rp.Permission?.Scope}', IsGranted: {rp.IsGranted}, Activo: {rp.Activo}, Permission.Activo: {rp.Permission?.Activo}");
            }
            
            return matchingPermissions.Any();
        }
    }
}
