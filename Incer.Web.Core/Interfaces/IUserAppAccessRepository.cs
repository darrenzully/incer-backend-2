using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IUserAppAccessRepository : IRepository<UserAppAccess>
    {
        Task<IEnumerable<UserAppAccess>> GetByUserIdAsync(int userId);
        Task<IEnumerable<UserAppAccess>> GetByAppIdAsync(int appId);
        Task<UserAppAccess?> GetByUserIdAndAppIdAsync(int userId, int appId);
        Task<IEnumerable<UserAppAccess>> GetActiveByUserIdAsync(int userId);
    }
}
