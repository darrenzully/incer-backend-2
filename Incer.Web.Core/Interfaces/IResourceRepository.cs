using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IResourceRepository : IRepository<Resource>
    {
        Task<Resource?> GetByNameAsync(string name);
        Task<IEnumerable<Resource>> GetByAppIdAsync(int appId);
        Task<IEnumerable<Resource>> GetByCategoryAsync(string category);
        Task<IEnumerable<Resource>> GetActiveResourcesAsync();
    }
}
