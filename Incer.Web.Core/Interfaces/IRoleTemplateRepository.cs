using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IRoleTemplateRepository : IRepository<RoleTemplate>
    {
        Task<RoleTemplate?> GetByNameAsync(string name);
        Task<IEnumerable<RoleTemplate>> GetActiveTemplatesAsync();
        Task<IEnumerable<RoleTemplate>> GetTemplatesByCategoryAsync(string category);
        Task<IEnumerable<Permission>> GetPermissionsByTemplateIdAsync(int templateId);
        Task<bool> AssignPermissionToTemplateAsync(int templateId, int permissionId);
        Task<bool> RemovePermissionFromTemplateAsync(int templateId, int permissionId);
        Task<Role?> CreateRoleFromTemplateAsync(int templateId, string roleName, string roleDescription);
    }
}
