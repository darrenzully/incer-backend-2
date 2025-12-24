using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IActionRepository : IRepository<Core.Entities.Action>
    {
        Task<Core.Entities.Action?> GetByNameAsync(string name);
        Task<IEnumerable<Core.Entities.Action>> GetByAppIdAsync(int appId);
        Task<IEnumerable<Core.Entities.Action>> GetByCategoryAsync(string category);
        Task<IEnumerable<Core.Entities.Action>> GetActiveActionsAsync();
    }
}
