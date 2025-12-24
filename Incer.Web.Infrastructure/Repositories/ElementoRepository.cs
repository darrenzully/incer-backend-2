using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ElementoRepository : Repository<Elemento>, IElementoRepository
    {
        public ElementoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Elemento>> GetBySucursalIdAsync(int sucursalId)
        {
            return await _context.Set<Elemento>()
                .Where(e => e.SucursalId == sucursalId && e.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Elemento>> GetByTipoElementoIdAsync(int tipoElementoId)
        {
            return await _context.Set<Elemento>()
                .Where(e => e.TipoDeElementoId == tipoElementoId && e.Activo)
                .ToListAsync();
        }
    }
}
