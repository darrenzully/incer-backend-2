using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class UserCenterAppAccessRepository : Repository<UserCenterAppAccess>, IUserCenterAppAccessRepository
    {
        public UserCenterAppAccessRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<UserCenterAppAccess>> GetByUserIdAsync(int userId)
        {
            return await _context.UserCenterAppAccesses
                .Include(uca => uca.BusinessCenter)
                .Include(uca => uca.Application)
                .Where(uca => uca.UserId == userId && uca.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserCenterAppAccess>> GetByBusinessCenterIdAsync(int businessCenterId)
        {
            return await _context.UserCenterAppAccesses
                .Include(uca => uca.User)
                .ThenInclude(u => u.Role)
                .Include(uca => uca.Application)
                .Where(uca => uca.BusinessCenterId == businessCenterId && uca.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserCenterAppAccess>> GetByAppIdAsync(int appId)
        {
            return await _context.UserCenterAppAccesses
                .Include(uca => uca.User)
                .ThenInclude(u => u.Role)
                .Include(uca => uca.BusinessCenter)
                .Where(uca => uca.AppId == appId && uca.Activo)
                .ToListAsync();
        }

        public async Task<UserCenterAppAccess?> GetByUserIdAndBusinessCenterIdAndAppIdAsync(int userId, int businessCenterId, int appId)
        {
            return await _context.UserCenterAppAccesses
                .Include(uca => uca.BusinessCenter)
                .Include(uca => uca.Application)
                .FirstOrDefaultAsync(uca => uca.UserId == userId && uca.BusinessCenterId == businessCenterId && uca.AppId == appId && uca.Activo);
        }

        public async Task<IEnumerable<UserCenterAppAccess>> GetActiveByUserIdAsync(int userId)
        {
            return await _context.UserCenterAppAccesses
                .Include(uca => uca.BusinessCenter)
                .Include(uca => uca.Application)
                .Where(uca => uca.UserId == userId && uca.Active && uca.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserCenterAppAccess>> GetDefaultByUserIdAsync(int userId)
        {
            return await _context.UserCenterAppAccesses
                .Include(uca => uca.BusinessCenter)
                .Include(uca => uca.Application)
                .Where(uca => uca.UserId == userId && uca.IsDefault && uca.Active && uca.Activo)
                .ToListAsync();
        }
    }
}
