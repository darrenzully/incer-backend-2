using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ActionRepository : Repository<Core.Entities.Action>, IActionRepository
    {
        public ActionRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<Core.Entities.Action?> GetByNameAsync(string name)
        {
            return await _context.Actions
                .FirstOrDefaultAsync(a => a.Name == name && a.Activo);
        }

        public async Task<IEnumerable<Core.Entities.Action>> GetByAppIdAsync(int appId)
        {
            return await _context.Actions
                .Where(a => a.AppId == appId && a.Activo)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Core.Entities.Action>> GetByCategoryAsync(string category)
        {
            return await _context.Actions
                .Where(a => a.Category == category && a.Activo)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Core.Entities.Action>> GetActiveActionsAsync()
        {
            return await _context.Actions
                .Where(a => a.Activo)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }
    }
}
