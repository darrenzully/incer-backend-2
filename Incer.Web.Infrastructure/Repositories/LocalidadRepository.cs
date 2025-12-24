using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class LocalidadRepository : Repository<Localidad>, ILocalidadRepository
    {
        public LocalidadRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Localidad>> GetByProvinciaIdAsync(int provinciaId)
        {
            return await _context.Localidades
                .Include(l => l.Provincia)
                .Where(l => l.ProvinciaId == provinciaId && l.Activo)
                .OrderBy(l => l.Nombre)
                .ToListAsync();
        }
    }
} 