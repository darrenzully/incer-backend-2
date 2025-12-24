using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class OrdenDeTrabajoRepository : Repository<OrdenDeTrabajo>, IOrdenDeTrabajoRepository
    {
        public OrdenDeTrabajoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesBySucursalAsync(int sucursalId)
        {
            return await _context.OrdenesDeTrabajo
                .Include(ot => ot.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(ot => ot.Usuario)
                .Include(ot => ot.Prioridad)
                .Include(ot => ot.EstadoDeOT)
                .Include(ot => ot.Remito)
                .Include(ot => ot.Detalles)
                .Where(ot => ot.SucursalId == sucursalId && ot.Activo)
                .OrderByDescending(ot => ot.FechaIngreso)
                .ToListAsync();
        }

        public async Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesByUsuarioAsync(int usuarioId)
        {
            return await _context.OrdenesDeTrabajo
                .Include(ot => ot.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(ot => ot.Usuario)
                .Include(ot => ot.Prioridad)
                .Include(ot => ot.EstadoDeOT)
                .Include(ot => ot.Remito)
                .Include(ot => ot.Detalles)
                .Where(ot => ot.UsuarioId == usuarioId && ot.Activo)
                .OrderByDescending(ot => ot.FechaIngreso)
                .ToListAsync();
        }

        public async Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesByEstadoAsync(int estadoId)
        {
            return await _context.OrdenesDeTrabajo
                .Include(ot => ot.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(ot => ot.Usuario)
                .Include(ot => ot.Prioridad)
                .Include(ot => ot.EstadoDeOT)
                .Include(ot => ot.Remito)
                .Include(ot => ot.Detalles)
                .Where(ot => ot.EstadoDeOTId == estadoId && ot.Activo)
                .OrderByDescending(ot => ot.FechaIngreso)
                .ToListAsync();
        }

        public async Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesByFechaAsync(DateTime fechaDesde, DateTime fechaHasta)
        {
            return await _context.OrdenesDeTrabajo
                .Include(ot => ot.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(ot => ot.Usuario)
                .Include(ot => ot.Prioridad)
                .Include(ot => ot.EstadoDeOT)
                .Include(ot => ot.Remito)
                .Include(ot => ot.Detalles)
                .Where(ot => ot.FechaIngreso >= fechaDesde && ot.FechaIngreso <= fechaHasta && ot.Activo)
                .OrderByDescending(ot => ot.FechaIngreso)
                .ToListAsync();
        }

        public async Task<int> GetNextNumeroAsync()
        {
            var ultimoNumero = await _context.OrdenesDeTrabajo
                .Where(ot => ot.Activo)
                .MaxAsync(ot => (int?)ot.Numero);
            
            return (ultimoNumero ?? 0) + 1;
        }

        public override async Task<IEnumerable<OrdenDeTrabajo>> GetAllAsync()
        {
            return await _context.OrdenesDeTrabajo
                .Include(ot => ot.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(ot => ot.Usuario)
                .Include(ot => ot.Prioridad)
                .Include(ot => ot.EstadoDeOT)
                .Include(ot => ot.Remito)
                .Include(ot => ot.Detalles)
                .Where(ot => ot.Activo)
                .OrderByDescending(ot => ot.FechaIngreso)
                .ToListAsync();
        }

        public override async Task<OrdenDeTrabajo?> GetByIdAsync(int id)
        {
            return await _context.OrdenesDeTrabajo
                .Include(ot => ot.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(ot => ot.Usuario)
                .Include(ot => ot.Prioridad)
                .Include(ot => ot.EstadoDeOT)
                .Include(ot => ot.Remito)
                .Include(ot => ot.Detalles)
                .FirstOrDefaultAsync(ot => ot.Id == id);
        }
    }
}
