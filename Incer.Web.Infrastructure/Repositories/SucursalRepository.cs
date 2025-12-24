using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class SucursalRepository : Repository<Sucursal>, ISucursalRepository
    {
        public SucursalRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Sucursal>> GetByClienteIdAsync(int clienteId)
        {
            return await _context.Sucursales
                .Include(s => s.Cliente)
                .Include(s => s.Localidad)
                    .ThenInclude(l => l!.Provincia)
                .Where(s => s.ClienteId == clienteId && s.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sucursal>> GetActivasAsync()
        {
            return await _context.Sucursales
                .Include(s => s.Cliente)
                .Include(s => s.Localidad)
                    .ThenInclude(l => l!.Provincia)
                .Where(s => s.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Sucursal>> GetAllForAdminAsync()
        {
            return await _context.Sucursales
                .Include(s => s.Cliente)
                .Include(s => s.Localidad)
                    .ThenInclude(l => l!.Provincia)
                .ToListAsync();
        }

        public async Task<Sucursal?> GetByIdForAdminAsync(int id)
        {
            return await _context.Sucursales
                .Include(s => s.Cliente)
                .Include(s => s.Localidad)
                    .ThenInclude(l => l!.Provincia)
                .FirstOrDefaultAsync(s => s.Id == id);
        }
    }
} 