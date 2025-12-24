using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IAppRepository : IRepository<App>
    {
        Task<App?> GetByNameAsync(string name);
        Task<IEnumerable<App>> GetActiveAppsAsync();
        Task<IEnumerable<App>> GetAppsByUserIdAsync(int userId);
        Task<IEnumerable<Permission>> GetPermissionsByAppIdAsync(int appId);
        Task<bool> AssignPermissionToAppAsync(int appId, int permissionId);
        Task<bool> RemovePermissionFromAppAsync(int appId, int permissionId);
    }
}
