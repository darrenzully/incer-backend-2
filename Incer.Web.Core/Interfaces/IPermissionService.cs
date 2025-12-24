using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IPermissionService
    {
        Task<bool> CheckPermissionAsync(int userId, string resource, string action, int? centerId = null, int? appId = null);
        Task<bool> CheckPermissionAsync(string resource, string action, int? centerId = null, int? appId = null);
        Task<IEnumerable<Permission>> GetUserPermissionsAsync(int userId, int? appId = null);
        Task<IEnumerable<Permission>> GetCurrentUserPermissionsAsync(int? appId = null);
        Task<IEnumerable<int>> GetUserAccessibleCentersAsync(int userId, int? appId = null);
        Task<IEnumerable<int>> GetCurrentUserAccessibleCentersAsync(int? appId = null);
        Task<IEnumerable<int>> GetUserAccessibleAppsAsync(int userId);
        Task<IEnumerable<int>> GetCurrentUserAccessibleAppsAsync();
        Task<bool> CanAccessAppAsync(int userId, int appId);
        Task<bool> CanAccessCenterInAppAsync(int userId, int centerId, int appId);
    }
}
