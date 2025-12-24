using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class RelevamientoRepository : Repository<Relevamiento>, IRelevamientoRepository
    {
        public RelevamientoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public override async Task<IEnumerable<Relevamiento>> GetAllAsync()
        {
            return await _context.Relevamientos
                .Include(r => r.Tarea)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.Usuario)
                .Include(r => r.EstadoTarea)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.CheckList)
                .Where(r => r.Activo)
                .OrderBy(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Relevamiento>> GetRelevamientosByTareaAsync(int tareaId)
        {
            return await _context.Relevamientos
                .Include(r => r.Tarea)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.Usuario)
                .Include(r => r.EstadoTarea)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.CheckList)
                .Where(r => r.TareaId == tareaId && r.Activo)
                .OrderBy(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Relevamiento>> GetRelevamientosByUsuarioAsync(int usuarioId)
        {
            return await _context.Relevamientos
                .Include(r => r.Tarea)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.Usuario)
                .Include(r => r.EstadoTarea)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.CheckList)
                .Where(r => r.UsuarioId == usuarioId && r.Activo)
                .OrderBy(r => r.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Relevamiento>> GetRelevamientosBySucursalAsync(int sucursalId)
        {
            return await _context.Relevamientos
                .Include(r => r.Tarea)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.Usuario)
                .Include(r => r.EstadoTarea)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.CheckList)
                .Where(r => r.SucursalId == sucursalId && r.Activo)
                .OrderBy(r => r.Fecha)
                .ToListAsync();
        }

        public override async Task<Relevamiento?> GetByIdAsync(int id)
        {
            return await _context.Relevamientos
                .Include(r => r.Tarea)
                .Include(r => r.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(r => r.Usuario)
                .Include(r => r.EstadoTarea)
                .Include(r => r.TipoDeProducto)
                .Include(r => r.CheckList)
                // .Include(r => r.RelevamientoDetalles)
                //     .ThenInclude(rd => rd.CheckListDetalle) // Comentado - propiedad no existe
                // .Include(r => r.RelevamientoDetalles)
                //     .ThenInclude(rd => rd.RelevamientoDetalleResultados) // Comentado - propiedad no existe
                //         .ThenInclude(rdr => rdr.CheckListDetalle)
                .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
