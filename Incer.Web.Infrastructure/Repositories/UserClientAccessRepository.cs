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
    public class UserClientAccessRepository : Repository<UserClientAccess>, IUserClientAccessRepository
    {
        public UserClientAccessRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<UserClientAccess>> GetByUserIdAsync(int userId)
        {
            return await _context.UserClientAccesses
                .Include(uca => uca.Cliente)
                .ThenInclude(c => c.BusinessCenter)
                .Include(uca => uca.Application)
                .Where(uca => uca.UserId == userId && uca.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserClientAccess>> GetByClienteIdAsync(int clienteId)
        {
            return await _context.UserClientAccesses
                .Include(uca => uca.User)
                .ThenInclude(u => u.Role)
                .Include(uca => uca.Application)
                .Where(uca => uca.ClienteId == clienteId && uca.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserClientAccess>> GetByAppIdAsync(int appId)
        {
            return await _context.UserClientAccesses
                .Include(uca => uca.User)
                .ThenInclude(u => u.Role)
                .Include(uca => uca.Cliente)
                .ThenInclude(c => c.BusinessCenter)
                .Where(uca => uca.AppId == appId && uca.Activo)
                .ToListAsync();
        }

        public async Task<UserClientAccess?> GetByUserIdAndClienteIdAndAppIdAsync(int userId, int clienteId, int appId)
        {
            return await _context.UserClientAccesses
                .FirstOrDefaultAsync(uca => uca.UserId == userId && 
                                           uca.ClienteId == clienteId && 
                                           uca.AppId == appId && 
                                           uca.Activo);
        }

        public async Task<IEnumerable<UserClientAccess>> GetActiveByUserIdAsync(int userId)
        {
            return await _context.UserClientAccesses
                .Include(uca => uca.Cliente)
                .ThenInclude(c => c.BusinessCenter)
                .Include(uca => uca.Application)
                .Where(uca => uca.UserId == userId && uca.Active && uca.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserClientAccess>> GetByUserIdAndCenterIdAsync(int userId, int centerId)
        {
            return await _context.UserClientAccesses
                .Include(uca => uca.Cliente)
                .ThenInclude(c => c.BusinessCenter)
                .Include(uca => uca.Application)
                .Where(uca => uca.UserId == userId && 
                             uca.Cliente.BusinessCenterId == centerId && 
                             uca.Activo)
                .ToListAsync();
        }
    }
}

