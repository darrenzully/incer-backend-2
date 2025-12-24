using Microsoft.EntityFrameworkCore;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class RemitoRepository : Repository<Remito>, IRemitoRepository
    {
        private new readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public RemitoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public override async Task<IEnumerable<Remito>> GetAllAsync()
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                // .Include(r => r.Presupuesto) // Comentado - propiedad no existe
                .Where(r => r.Activo)
                .OrderByDescending(r => r.Fecha)
                .ThenByDescending(r => r.Id)
                .ToListAsync();
        }

        public override async Task<Remito?> GetByIdAsync(int id)
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                // .Include(r => r.Presupuesto) // Comentado - propiedad no existe
                .Include(r => r.RemitoManual)
                .Include(r => r.RemitoOficial)
                .FirstOrDefaultAsync(r => r.Id == id && r.Activo);
        }

        public async Task<IEnumerable<Remito>> GetRemitosWithDetailsAsync()
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                // .Include(r => r.Presupuesto) // Comentado - propiedad no existe
                .Where(r => r.Activo)
                .OrderByDescending(r => r.Fecha)
                .ThenByDescending(r => r.Id)
                .ToListAsync();
        }

        public async Task<Remito?> GetRemitoWithDetailsAsync(int id)
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                // .Include(r => r.Presupuesto) // Comentado - propiedad no existe
                .Include(r => r.RemitoManual)
                .Include(r => r.RemitoOficial)
                .FirstOrDefaultAsync(r => r.Id == id && r.Activo);
        }

        public async Task<string> GenerateNextRemitoNumberAsync(int choferId, string? letra = null, string? secuencia = null)
        {
            var remitoUsuario = await _context.RemitoUsuarios
                .Where(ru => ru.ChoferId == choferId && ru.Activo)
                .FirstOrDefaultAsync();

            if (remitoUsuario == null)
            {
                throw new InvalidOperationException("No se encontró configuración de numeración para el chofer");
            }

            var ultimoNumero = await _context.Remitos
                .Where(r => r.ChoferId == choferId && r.Activo)
                .MaxAsync(r => (int?)r.Numero) ?? (remitoUsuario.NumeroDesde - 1);

            var siguienteNumero = ultimoNumero + 1;

            if (siguienteNumero > remitoUsuario.NumeroHasta)
            {
                throw new InvalidOperationException("Se ha alcanzado el límite máximo de numeración para este chofer");
            }

            return $"{remitoUsuario.Letra}{remitoUsuario.Secuencia}{siguienteNumero:D4}";
        }

        public async Task<IEnumerable<Remito>> GetRemitosBySucursalIdAsync(int sucursalId)
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                .Where(r => r.SucursalId == sucursalId && r.Activo)
                .OrderByDescending(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Remito>> GetRemitosByEstadoAsync(EstadoRemito estado)
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                .Where(r => r.EstadoRemito == estado && r.Activo)
                .OrderByDescending(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Remito>> GetRemitosByChoferIdAsync(int choferId)
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                .Where(r => r.ChoferId == choferId && r.Activo)
                .OrderByDescending(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Remito>> GetRemitosByFechaAsync(DateTime fechaDesde, DateTime fechaHasta)
        {
            return await _context.Remitos
                .Include(r => r.Chofer)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.RemitoUsuario)
                .Where(r => r.Fecha >= fechaDesde && r.Fecha <= fechaHasta && r.Activo)
                .OrderByDescending(r => r.Fecha)
                .ToListAsync();
        }
    }
}
