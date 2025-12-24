using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IUserClientAccessRepository : IRepository<UserClientAccess>
    {
        Task<IEnumerable<UserClientAccess>> GetByUserIdAsync(int userId);
        Task<IEnumerable<UserClientAccess>> GetByClienteIdAsync(int clienteId);
        Task<IEnumerable<UserClientAccess>> GetByAppIdAsync(int appId);
        Task<UserClientAccess?> GetByUserIdAndClienteIdAndAppIdAsync(int userId, int clienteId, int appId);
        Task<IEnumerable<UserClientAccess>> GetActiveByUserIdAsync(int userId);
        Task<IEnumerable<UserClientAccess>> GetByUserIdAndCenterIdAsync(int userId, int centerId);
    }
}

