using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ExtintorHistoriaRepository : Repository<ExtintorHistoria>, IExtintorHistoriaRepository
    {
        public ExtintorHistoriaRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<ExtintorHistoria>> GetByExtintorIdAsync(int extintorId)
        {
            return await _context.Set<ExtintorHistoria>()
                .Where(h => h.ExtintorId == extintorId && h.Activo)
                .OrderByDescending(h => h.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExtintorHistoria>> GetBySucursalIdAsync(int sucursalId)
        {
            return await _context.Set<ExtintorHistoria>()
                .Where(h => h.SucursalId == sucursalId && h.Activo)
                .OrderByDescending(h => h.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExtintorHistoria>> GetByPuestoIdAsync(int puestoId)
        {
            return await _context.Set<ExtintorHistoria>()
                .Where(h => h.PuestoId == puestoId && h.Activo)
                .OrderByDescending(h => h.Fecha)
                .ToListAsync();
        }
    }
}

