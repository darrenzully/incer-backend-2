using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ExtintorRepository : Repository<Extintor>, IExtintorRepository
    {
        public ExtintorRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Extintor>> GetBySucursalIdAsync(int sucursalId)
        {
            return await _context.Set<Extintor>()
                .Where(e => e.SucursalId == sucursalId && e.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Extintor>> GetByClienteIdAsync(int clienteId)
        {
            return await _context.Set<Extintor>()
                .Where(e => e.ClienteId == clienteId && e.Activo)
                .ToListAsync();
        }
    }
}
