using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class TipoElementoRepository : Repository<TipoDeElemento>, ITipoElementoRepository
    {
        public TipoElementoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public override async Task<IEnumerable<TipoDeElemento>> GetAllAsync()
        {
            return await _context.TiposElemento
                .Where(t => t.Activo)
                .OrderBy(t => t.Nombre)
                .ToListAsync();
        }

        public override async Task<TipoDeElemento?> GetByIdAsync(int id)
        {
            return await _context.TiposElemento
                .FirstOrDefaultAsync(t => t.Id == id && t.Activo);
        }

        public async Task<IEnumerable<TipoDeElemento>> GetByNombreAsync(string nombre)
        {
            return await _context.TiposElemento
                .Where(t => t.Nombre.Contains(nombre) && t.Activo)
                .OrderBy(t => t.Nombre)
                .ToListAsync();
        }

        public async Task<TipoDeElemento?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.TiposElemento
                .Include(t => t.Detalles)
                .ThenInclude(d => d.TipoDeDato)
                .FirstOrDefaultAsync(t => t.Id == id && t.Activo);
        }

        public async Task<IEnumerable<TipoDeElemento>> GetAllWithDetailsAsync()
        {
            return await _context.TiposElemento
                .Include(t => t.Detalles)
                .ThenInclude(d => d.TipoDeDato)
                .Where(t => t.Activo)
                .OrderBy(t => t.Nombre)
                .ToListAsync();
        }
    }
}
