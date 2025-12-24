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
    public class UserAppAccessRepository : Repository<UserAppAccess>, IUserAppAccessRepository
    {
        public UserAppAccessRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<UserAppAccess>> GetByUserIdAsync(int userId)
        {
            return await _context.UserAppAccesses
                .Include(uaa => uaa.Application)
                .Where(uaa => uaa.UserId == userId && uaa.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserAppAccess>> GetByAppIdAsync(int appId)
        {
            return await _context.UserAppAccesses
                .Include(uaa => uaa.User)
                .ThenInclude(u => u.Role)
                .Where(uaa => uaa.AppId == appId && uaa.Activo)
                .ToListAsync();
        }

        public async Task<UserAppAccess?> GetByUserIdAndAppIdAsync(int userId, int appId)
        {
            return await _context.UserAppAccesses
                .Include(uaa => uaa.Application)
                .FirstOrDefaultAsync(uaa => uaa.UserId == userId && uaa.AppId == appId && uaa.Activo);
        }

        public async Task<IEnumerable<UserAppAccess>> GetActiveByUserIdAsync(int userId)
        {
            return await _context.UserAppAccesses
                .Include(uaa => uaa.Application)
                .Where(uaa => uaa.UserId == userId && uaa.Active && uaa.Activo)
                .ToListAsync();
        }
    }
}
