using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class ArchivoRepository : Repository<Archivo>, IArchivoRepository
    {
        public ArchivoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
            : base(context, httpContextAccessor)
        {
        }

        public async Task<Archivo?> GetByNombreAsync(string nombre)
        {
            return await _context.Archivos
                .FirstOrDefaultAsync(a => a.Nombre == nombre && a.Activo);
        }

        public async Task<IEnumerable<Archivo>> GetByFechaAsync(DateTime fecha)
        {
            return await _context.Archivos
                .Where(a => a.Fecha.Date == fecha.Date && a.Activo)
                .OrderByDescending(a => a.Fecha)
                .ToListAsync();
        }
    }
}
