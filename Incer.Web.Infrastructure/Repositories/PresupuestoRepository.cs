using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class PresupuestoRepository : Repository<Presupuesto>, IPresupuestoRepository
    {
        public PresupuestoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
            : base(context, httpContextAccessor)
        {
        }

        public override async Task<IEnumerable<Presupuesto>> GetAllAsync()
        {
            return await _context.Presupuestos
                .Include(p => p.Usuario)
                .Include(p => p.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(p => p.Archivos)
                .Where(p => p.Activo)
                .OrderByDescending(p => p.Fecha)
                .ThenByDescending(p => p.Id)
                .ToListAsync();
        }

        public override async Task<Presupuesto?> GetByIdAsync(int id)
        {
            return await _context.Presupuestos
                .Include(p => p.Usuario)
                .Include(p => p.Sucursal)
                .Include(p => p.Archivos)
                .Include(p => p.PresupuestosRemitos!)
                    .ThenInclude(pr => pr.Remito)
                .Include(p => p.PresupuestosArchivos!)
                    .ThenInclude(pa => pa.Archivo)
                .FirstOrDefaultAsync(p => p.Id == id && p.Activo);
        }

        public async Task<IEnumerable<Presupuesto>> GetPresupuestosWithDetailsAsync()
        {
            return await _context.Presupuestos
                .Include(p => p.Usuario)
                .Include(p => p.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(p => p.Archivos)
                .Where(p => p.Activo)
                .OrderByDescending(p => p.Fecha)
                .ThenByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<Presupuesto?> GetPresupuestoWithDetailsAsync(int id)
        {
            return await _context.Presupuestos
                .Include(p => p.Usuario)
                .Include(p => p.Sucursal)
                .Include(p => p.Archivos)
                .Include(p => p.PresupuestosRemitos!)
                    .ThenInclude(pr => pr.Remito)
                .Include(p => p.PresupuestosArchivos!)
                    .ThenInclude(pa => pa.Archivo)
                .FirstOrDefaultAsync(p => p.Id == id && p.Activo);
        }

        public async Task<IEnumerable<Presupuesto>> GetPresupuestosBySucursalAsync(int sucursalId)
        {
            return await _context.Presupuestos
                .Include(p => p.Usuario)
                .Include(p => p.Sucursal)
                .Include(p => p.Archivos)
                .Where(p => p.SucursalId == sucursalId && p.Activo)
                .OrderByDescending(p => p.Fecha)
                .ThenByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<IEnumerable<Presupuesto>> GetPresupuestosByEstadoAsync(EstadoPresupuesto estado)
        {
            return await _context.Presupuestos
                .Include(p => p.Usuario)
                .Include(p => p.Sucursal)
                .Include(p => p.Archivos)
                .Where(p => p.Estado == estado && p.Activo)
                .OrderByDescending(p => p.Fecha)
                .ThenByDescending(p => p.Id)
                .ToListAsync();
        }

        public async Task<string> GenerateNextNumeroAsync()
        {
            var year = DateTime.Now.Year;
            var lastPresupuesto = await _context.Presupuestos
                .Where(p => p.Numero.StartsWith($"P{year}"))
                .OrderByDescending(p => p.Numero)
                .FirstOrDefaultAsync();

            if (lastPresupuesto == null)
            {
                return $"P{year}0001";
            }

            var lastNumber = lastPresupuesto.Numero.Substring(5); // Remove "PYYYY"
            if (int.TryParse(lastNumber, out int number))
            {
                return $"P{year}{(number + 1):D4}";
            }

            return $"P{year}0001";
        }
    }
}
