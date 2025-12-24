using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class TareaRepository : Repository<Tarea>, ITareaRepository
    {
        public TareaRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IEnumerable<Tarea>> GetTareasPendientesAsync()
        {
            return await _context.Tareas
                .Include(t => t.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(t => t.Usuario)
                .Include(t => t.EstadoTarea)
                .Include(t => t.TipoDeTarea)
                .Include(t => t.Presupuesto)
                .Where(t => t.EstadoTareaId == 1 && t.Activo) // Estado Pendiente
                .OrderBy(t => t.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tarea>> GetSolicitudesAsync()
        {
            return await _context.Tareas
                .Include(t => t.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(t => t.Usuario)
                .Include(t => t.EstadoTarea)
                .Include(t => t.TipoDeTarea)
                .Include(t => t.Presupuesto)
                .Where(t => t.EstadoTareaId != 1 && t.Activo) // Estados diferentes a Pendiente
                .OrderBy(t => t.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tarea>> GetTareasByUsuarioAsync(int usuarioId)
        {
            return await _context.Tareas
                .Include(t => t.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(t => t.Usuario)
                .Include(t => t.EstadoTarea)
                .Include(t => t.TipoDeTarea)
                .Include(t => t.Presupuesto)
                .Where(t => t.UsuarioId == usuarioId && t.Activo)
                .OrderBy(t => t.Fecha)
                .ToListAsync();
        }

        public async Task<IEnumerable<Tarea>> GetTareasBySucursalAsync(int sucursalId)
        {
            return await _context.Tareas
                .Include(t => t.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(t => t.Usuario)
                .Include(t => t.EstadoTarea)
                .Include(t => t.TipoDeTarea)
                .Include(t => t.Presupuesto)
                .Where(t => t.SucursalId == sucursalId && t.Activo)
                .OrderBy(t => t.Fecha)
                .ToListAsync();
        }

        public override async Task<Tarea?> GetByIdAsync(int id)
        {
            return await _context.Tareas
                .Include(t => t.Sucursal)
                    .ThenInclude(s => s!.Cliente)
                .Include(t => t.Usuario)
                .Include(t => t.EstadoTarea)
                .Include(t => t.TipoDeTarea)
                .Include(t => t.Periodicidad)
                .Include(t => t.Prioridad)
                .Include(t => t.TipoDeProducto)
                .Include(t => t.TipoDeElemento)
                .Include(t => t.Presupuesto)
                .Include(t => t.Contacto)
                .FirstOrDefaultAsync(t => t.Id == id);
        }
    }
}
