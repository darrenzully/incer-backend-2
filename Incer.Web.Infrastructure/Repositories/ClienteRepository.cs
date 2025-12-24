using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ClienteRepository : Repository<Cliente>, IClienteRepository
    {
        public ClienteRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Cliente>> GetClientesWithDetailsAsync()
        {
            return await _context.Set<Cliente>()
                .Include(c => c.TipoDeCliente)
                .Include(c => c.TipoDeServicio)
                .Include(c => c.BusinessCenter)
                .Include(c => c.Vendedor)
                .Include(c => c.Alcances)
                .Include(c => c.AlcancesDetalles)
                .Where(c => c.Activo)
                .ToListAsync();
        }

        public async Task<Cliente?> GetClienteWithDetailsAsync(int id)
        {
            return await _context.Set<Cliente>()
                .Include(c => c.TipoDeCliente)
                .Include(c => c.TipoDeServicio)
                .Include(c => c.BusinessCenter)
                .Include(c => c.Vendedor)
                .Include(c => c.Alcances)
                .Include(c => c.AlcancesDetalles)
                .Include(c => c.Archivos)
                .Include(c => c.ClienteArchivos)
                .FirstOrDefaultAsync(c => c.Id == id && c.Activo);
        }

        public async Task<IEnumerable<Cliente>> GetClientesByVendedorAsync(int vendedorId)
        {
            return await _context.Set<Cliente>()
                .Include(c => c.TipoDeCliente)
                .Include(c => c.TipoDeServicio)
                .Include(c => c.BusinessCenter)
                .Where(c => c.VendedorId == vendedorId && c.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Cliente>> GetClientesByCentroAsync(int businessCenterId)
        {
            return await _context.Set<Cliente>()
                .Include(c => c.TipoDeCliente)
                .Include(c => c.TipoDeServicio)
                .Include(c => c.Vendedor)
                .Where(c => c.BusinessCenterId == businessCenterId && c.Activo)
                .ToListAsync();
        }

        public async Task<IEnumerable<Cliente>> GetAllForAdminAsync()
        {
            return await _context.Set<Cliente>()
                .Include(c => c.TipoDeCliente)
                .Include(c => c.TipoDeServicio)
                .Include(c => c.BusinessCenter)
                .Include(c => c.Vendedor)
                .Include(c => c.Alcances)
                .Include(c => c.AlcancesDetalles)
                .ToListAsync();
        }

        public async Task<Cliente?> GetByIdForAdminAsync(int id)
        {
            return await _context.Set<Cliente>()
                .Include(c => c.TipoDeCliente)
                .Include(c => c.TipoDeServicio)
                .Include(c => c.BusinessCenter)
                .Include(c => c.Vendedor)
                .Include(c => c.Alcances)
                .Include(c => c.AlcancesDetalles)
                .Include(c => c.Archivos)
                .Include(c => c.ClienteArchivos)
                .FirstOrDefaultAsync(c => c.Id == id);
        }
    }
} 