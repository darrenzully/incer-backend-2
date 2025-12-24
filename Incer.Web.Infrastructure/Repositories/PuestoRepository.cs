using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class PuestoRepository : Repository<Puesto>, IPuestoRepository
    {
        public PuestoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Puesto>> GetBySucursalIdAsync(int sucursalId)
        {
            return await _context.Set<Puesto>()
                .Where(p => p.SucursalId == sucursalId && p.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Puesto>> GetByExtintorIdAsync(int extintorId)
        {
            return await _context.Set<Puesto>()
                .Where(p => p.ExtintorId == extintorId && p.Activo)
                .ToListAsync();
        }
    }
}
