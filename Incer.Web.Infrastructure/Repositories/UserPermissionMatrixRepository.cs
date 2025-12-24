using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class UserPermissionMatrixRepository : Repository<UserPermissionMatrix>, IUserPermissionMatrixRepository
    {
        public UserPermissionMatrixRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<UserPermissionMatrix>> GetByUserIdAsync(int userId)
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.App)
                .Include(upm => upm.BusinessCenter)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .Where(upm => upm.UserId == userId && upm.Activo && upm.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserPermissionMatrix>> GetByUserIdAndAppIdAsync(int userId, int appId)
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.App)
                .Include(upm => upm.BusinessCenter)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .Where(upm => upm.UserId == userId && upm.AppId == appId && upm.Activo && upm.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserPermissionMatrix>> GetByUserIdAndBusinessCenterIdAsync(int userId, int businessCenterId)
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.App)
                .Include(upm => upm.BusinessCenter)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .Where(upm => upm.UserId == userId && upm.BusinessCenterId == businessCenterId && upm.Activo && upm.IsActive)
                .ToListAsync();
        }

        public async Task<UserPermissionMatrix?> GetByUserAppResourceActionAsync(int userId, int appId, int businessCenterId, int resourceId, int actionId)
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.App)
                .Include(upm => upm.BusinessCenter)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .FirstOrDefaultAsync(upm => upm.UserId == userId && 
                                          upm.AppId == appId && 
                                          upm.BusinessCenterId == businessCenterId && 
                                          upm.ResourceId == resourceId && 
                                          upm.ActionId == actionId && 
                                          upm.Activo && 
                                          upm.IsActive);
        }

        public async Task<IEnumerable<UserPermissionMatrix>> GetMatrixForUserAsync(int userId)
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.App)
                .Include(upm => upm.BusinessCenter)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .Where(upm => upm.UserId == userId && upm.Activo && upm.IsActive)
                .OrderBy(upm => upm.App.Name)
                .ThenBy(upm => upm.BusinessCenter.Name)
                .ThenBy(upm => upm.Resource.Name)
                .ThenBy(upm => upm.Action.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserPermissionMatrix>> GetMatrixForAppAsync(int appId)
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.User)
                .Include(upm => upm.BusinessCenter)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .Where(upm => upm.AppId == appId && upm.Activo && upm.IsActive)
                .OrderBy(upm => upm.User.Alias)
                .ThenBy(upm => upm.BusinessCenter.Name)
                .ThenBy(upm => upm.Resource.Name)
                .ThenBy(upm => upm.Action.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserPermissionMatrix>> GetMatrixForBusinessCenterAsync(int businessCenterId)
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.User)
                .Include(upm => upm.App)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .Where(upm => upm.BusinessCenterId == businessCenterId && upm.Activo && upm.IsActive)
                .OrderBy(upm => upm.User.Alias)
                .ThenBy(upm => upm.App.Name)
                .ThenBy(upm => upm.Resource.Name)
                .ThenBy(upm => upm.Action.Name)
                .ToListAsync();
        }

        public async Task<bool> HasPermissionAsync(int userId, int appId, int businessCenterId, string resource, string action)
        {
            var permission = await _context.UserPermissionMatrices
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .FirstOrDefaultAsync(upm => upm.UserId == userId && 
                                          upm.AppId == appId && 
                                          upm.BusinessCenterId == businessCenterId && 
                                          upm.Resource.Name == resource && 
                                          upm.Action.Name == action && 
                                          upm.Activo && 
                                          upm.IsActive);

            return permission != null && permission.Type != PermissionType.Denied;
        }

        public async Task<IEnumerable<UserPermissionMatrix>> GetActivePermissionsAsync()
        {
            return await _context.UserPermissionMatrices
                .Include(upm => upm.User)
                .Include(upm => upm.App)
                .Include(upm => upm.BusinessCenter)
                .Include(upm => upm.Resource)
                .Include(upm => upm.Action)
                .Where(upm => upm.Activo && upm.IsActive)
                .OrderBy(upm => upm.User.Alias)
                .ThenBy(upm => upm.App.Name)
                .ThenBy(upm => upm.BusinessCenter.Name)
                .ThenBy(upm => upm.Resource.Name)
                .ThenBy(upm => upm.Action.Name)
                .ToListAsync();
        }
    }
}
