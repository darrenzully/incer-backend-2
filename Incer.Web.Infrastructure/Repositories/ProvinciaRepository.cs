using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ProvinciaRepository : Repository<Provincia>, IProvinciaRepository
    {
        public ProvinciaRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Provincia>> GetByPaisIdAsync(int paisId)
        {
            return await _context.Provincias
                .Include(p => p.Pais)
                .Where(p => p.PaisId == paisId && p.Activo)
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }
    }
} 