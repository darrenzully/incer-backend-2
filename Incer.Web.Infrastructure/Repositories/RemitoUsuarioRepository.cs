using Microsoft.EntityFrameworkCore;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class RemitoUsuarioRepository : Repository<RemitoUsuario>, IRemitoUsuarioRepository
    {
        private new readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RemitoUsuarioRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public override async Task<IEnumerable<RemitoUsuario>> GetAllAsync()
        {
            return await _context.RemitoUsuarios
                .Include(ru => ru.Chofer)
                .Where(ru => ru.Activo)
                .OrderByDescending(ru => ru.FechaCreacion)
                .ThenByDescending(ru => ru.Id)
                .ToListAsync();
        }

        public override async Task<RemitoUsuario?> GetByIdAsync(int id)
        {
            return await _context.RemitoUsuarios
                .Include(ru => ru.Chofer)
                .FirstOrDefaultAsync(ru => ru.Id == id && ru.Activo);
        }

        public async Task<IEnumerable<RemitoUsuario>> GetRemitoUsuariosWithDetailsAsync()
        {
            try
            {
                var query = _context.RemitoUsuarios
                    .Include(ru => ru.Chofer)
                    .Where(ru => ru.Activo);
                    
                var result = await query
                    .OrderBy(ru => ru.Id)
                    .ToListAsync();
                    
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERROR en GetRemitoUsuariosWithDetailsAsync: {ex.Message}");
                
                // Fallback sin Include si hay error
                var fallbackQuery = _context.RemitoUsuarios
                    .Where(ru => ru.Activo);
                    
                var fallbackResult = await fallbackQuery
                    .OrderBy(ru => ru.Id)
                    .ToListAsync();
                    
                return fallbackResult;
            }
        }

        public async Task<RemitoUsuario?> GetRemitoUsuarioWithDetailsAsync(int id)
        {
            return await _context.RemitoUsuarios
                .Include(ru => ru.Chofer)
                .FirstOrDefaultAsync(ru => ru.Id == id && ru.Activo);
        }

        public async Task<IEnumerable<RemitoUsuario>> GetRemitoUsuariosByChoferIdAsync(int choferId)
        {
            return await _context.RemitoUsuarios
                .Include(ru => ru.Chofer)
                .Where(ru => ru.ChoferId == choferId && ru.Activo)
                .OrderByDescending(ru => ru.FechaCreacion)
                .ToListAsync();
        }

        public async Task<bool> ExisteRangoNumerosAsync(int choferId, int numeroDesde, int numeroHasta, int? excludeId = null)
        {
            var query = _context.RemitoUsuarios
                .Where(ru => ru.ChoferId == choferId && ru.Activo);

            if (excludeId.HasValue)
            {
                query = query.Where(ru => ru.Id != excludeId.Value);
            }

            return await query.AnyAsync(ru => 
                (numeroDesde >= ru.NumeroDesde && numeroDesde <= ru.NumeroHasta) ||
                (numeroHasta >= ru.NumeroDesde && numeroHasta <= ru.NumeroHasta) ||
                (numeroDesde <= ru.NumeroDesde && numeroHasta >= ru.NumeroHasta));
        }
    }
}
