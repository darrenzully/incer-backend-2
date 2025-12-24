using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IUserCenterAppAccessRepository : IRepository<UserCenterAppAccess>
    {
        Task<IEnumerable<UserCenterAppAccess>> GetByUserIdAsync(int userId);
        Task<IEnumerable<UserCenterAppAccess>> GetByBusinessCenterIdAsync(int businessCenterId);
        Task<IEnumerable<UserCenterAppAccess>> GetByAppIdAsync(int appId);
        Task<UserCenterAppAccess?> GetByUserIdAndBusinessCenterIdAndAppIdAsync(int userId, int businessCenterId, int appId);
        Task<IEnumerable<UserCenterAppAccess>> GetActiveByUserIdAsync(int userId);
        Task<IEnumerable<UserCenterAppAccess>> GetDefaultByUserIdAsync(int userId);
    }
}
