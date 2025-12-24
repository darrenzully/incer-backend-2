using Microsoft.Extensions.Caching.Memory;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;

namespace Incer.Web.Infrastructure.Services
{
    public interface IPermissionCacheService
    {
        Task<bool> GetCachedPermissionAsync(int userId, string resource, string action, int? centerId = null, int? appId = null);
        void SetCachedPermission(int userId, string resource, string action, int? centerId, int? appId, bool hasPermission);
        Task<IEnumerable<int>> GetCachedUserCentersAsync(int userId, int? appId = null);
        void SetCachedUserCenters(int userId, int? appId, IEnumerable<int> centers);
        Task<IEnumerable<int>> GetCachedUserAppsAsync(int userId);
        void SetCachedUserApps(int userId, IEnumerable<int> apps);
        void ClearUserCache(int userId);
        void ClearAllCache();
    }

    public class PermissionCacheService : IPermissionCacheService
    {
        private readonly IMemoryCache _cache;
        private readonly IPermissionService _permissionService;
        private readonly TimeSpan _defaultExpiration = TimeSpan.FromMinutes(30);

        public PermissionCacheService(IMemoryCache cache, IPermissionService permissionService)
        {
            _cache = cache;
            _permissionService = permissionService;
        }

        public async Task<bool> GetCachedPermissionAsync(int userId, string resource, string action, int? centerId = null, int? appId = null)
        {
            var cacheKey = GeneratePermissionCacheKey(userId, resource, action, centerId, appId);
            
            if (_cache.TryGetValue(cacheKey, out bool cachedPermission))
            {
                return cachedPermission;
            }

            // Si no está en caché, obtener del servicio y cachear
            var hasPermission = await _permissionService.CheckPermissionAsync(userId, resource, action, centerId, appId);
            SetCachedPermission(userId, resource, action, centerId, appId, hasPermission);
            
            return hasPermission;
        }

        public void SetCachedPermission(int userId, string resource, string action, int? centerId, int? appId, bool hasPermission)
        {
            var cacheKey = GeneratePermissionCacheKey(userId, resource, action, centerId, appId);
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _defaultExpiration,
                SlidingExpiration = TimeSpan.FromMinutes(15)
            };
            
            _cache.Set(cacheKey, hasPermission, cacheOptions);
        }

        public async Task<IEnumerable<int>> GetCachedUserCentersAsync(int userId, int? appId = null)
        {
            var cacheKey = GenerateUserCentersCacheKey(userId, appId);
            
            if (_cache.TryGetValue(cacheKey, out IEnumerable<int>? cachedCenters))
            {
                return cachedCenters ?? Enumerable.Empty<int>();
            }

            // Si no está en caché, obtener del servicio y cachear
            var centers = await _permissionService.GetUserAccessibleCentersAsync(userId, appId);
            SetCachedUserCenters(userId, appId, centers);
            
            return centers;
        }

        public void SetCachedUserCenters(int userId, int? appId, IEnumerable<int> centers)
        {
            var cacheKey = GenerateUserCentersCacheKey(userId, appId);
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _defaultExpiration,
                SlidingExpiration = TimeSpan.FromMinutes(15)
            };
            
            _cache.Set(cacheKey, centers.ToList(), cacheOptions);
        }

        public async Task<IEnumerable<int>> GetCachedUserAppsAsync(int userId)
        {
            var cacheKey = GenerateUserAppsCacheKey(userId);
            
            if (_cache.TryGetValue(cacheKey, out IEnumerable<int>? cachedApps))
            {
                return cachedApps ?? Enumerable.Empty<int>();
            }

            // Si no está en caché, obtener del servicio y cachear
            var apps = await _permissionService.GetUserAccessibleAppsAsync(userId);
            SetCachedUserApps(userId, apps);
            
            return apps;
        }

        public void SetCachedUserApps(int userId, IEnumerable<int> apps)
        {
            var cacheKey = GenerateUserAppsCacheKey(userId);
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = _defaultExpiration,
                SlidingExpiration = TimeSpan.FromMinutes(15)
            };
            
            _cache.Set(cacheKey, apps.ToList(), cacheOptions);
        }

        public void ClearUserCache(int userId)
        {
            // Limpiar todas las entradas de caché relacionadas con el usuario
            // Nota: En una implementación real, podrías usar un patrón más sofisticado
            // como un diccionario de claves por usuario o usar Redis con patrones de clave
            
            // Por ahora, limpiaremos el caché completo cuando se modifique un usuario
            // En producción, considera usar Redis o implementar un sistema de tracking de claves
            // _cache.Clear(); // IMemoryCache no tiene método Clear()
            
            // Alternativa: usar un diccionario para rastrear claves por usuario
            // Por ahora, simplemente no hacemos nada
        }

        public void ClearAllCache()
        {
            // IMemoryCache no tiene método Clear()
            // En producción, considera usar Redis o implementar un sistema de tracking de claves
            // _cache.Clear();
        }

        private string GeneratePermissionCacheKey(int userId, string resource, string action, int? centerId, int? appId)
        {
            return $"permission:{userId}:{resource}:{action}:{centerId ?? 0}:{appId ?? 0}";
        }

        private string GenerateUserCentersCacheKey(int userId, int? appId)
        {
            return $"user_centers:{userId}:{appId ?? 0}";
        }

        private string GenerateUserAppsCacheKey(int userId)
        {
            return $"user_apps:{userId}";
        }
    }
}
