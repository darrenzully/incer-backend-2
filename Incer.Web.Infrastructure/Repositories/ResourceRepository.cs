using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ResourceRepository : Repository<Resource>, IResourceRepository
    {
        public ResourceRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<Resource?> GetByNameAsync(string name)
        {
            return await _context.Resources
                .FirstOrDefaultAsync(r => r.Name == name && r.Activo);
        }

        public async Task<IEnumerable<Resource>> GetByAppIdAsync(int appId)
        {
            return await _context.Resources
                .Where(r => r.AppId == appId && r.Activo)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Resource>> GetByCategoryAsync(string category)
        {
            return await _context.Resources
                .Where(r => r.Category == category && r.Activo)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Resource>> GetActiveResourcesAsync()
        {
            return await _context.Resources
                .Where(r => r.Activo)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }
    }
}
