using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IUserPermissionMatrixRepository : IRepository<UserPermissionMatrix>
    {
        Task<IEnumerable<UserPermissionMatrix>> GetByUserIdAsync(int userId);
        Task<IEnumerable<UserPermissionMatrix>> GetByUserIdAndAppIdAsync(int userId, int appId);
        Task<IEnumerable<UserPermissionMatrix>> GetByUserIdAndBusinessCenterIdAsync(int userId, int businessCenterId);
        Task<UserPermissionMatrix?> GetByUserAppResourceActionAsync(int userId, int appId, int businessCenterId, int resourceId, int actionId);
        Task<IEnumerable<UserPermissionMatrix>> GetMatrixForUserAsync(int userId);
        Task<IEnumerable<UserPermissionMatrix>> GetMatrixForAppAsync(int appId);
        Task<IEnumerable<UserPermissionMatrix>> GetMatrixForBusinessCenterAsync(int businessCenterId);
        Task<bool> HasPermissionAsync(int userId, int appId, int businessCenterId, string resource, string action);
        Task<IEnumerable<UserPermissionMatrix>> GetActivePermissionsAsync();
    }
}
