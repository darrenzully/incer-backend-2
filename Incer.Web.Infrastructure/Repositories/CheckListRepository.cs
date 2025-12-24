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
    public class CheckListRepository : Repository<CheckList>, ICheckListRepository
    {
        public CheckListRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public override async Task<IEnumerable<CheckList>> GetAllAsync()
        {
            return await _context.CheckLists
                .Include(c => c.TipoDeProducto)
                .Include(c => c.TipoDeElemento)
                .Include(c => c.Sucursal)
                .Include(c => c.Cliente)
                .Where(c => c.Activo)
                .OrderByDescending(c => c.Activo)
                .ThenByDescending(c => c.PorDefecto)
                .ThenBy(c => c.TipoDeProducto!.Nombre)
                .ThenBy(c => c.TipoDeElementoId)
                .ThenBy(c => c.SucursalId)
                .ToListAsync();
        }

        public override async Task<CheckList?> GetByIdAsync(int id)
        {
            return await _context.CheckLists
                .Include(c => c.TipoDeProducto)
                .Include(c => c.TipoDeElemento)
                .Include(c => c.Sucursal)
                .Include(c => c.Cliente)
                .FirstOrDefaultAsync(c => c.Id == id && c.Activo);
        }

        public async Task<IEnumerable<CheckList>> GetCheckListsWithDetailsAsync()
        {
            return await _context.CheckLists
                .Include(c => c.TipoDeProducto)
                .Include(c => c.TipoDeElemento)
                .Include(c => c.Sucursal)
                .Include(c => c.Cliente)
                .Include(c => c.Detalles!)
                    .ThenInclude(d => d.TipoDeDato)
                .Where(c => c.Activo)
                .OrderByDescending(c => c.Activo)
                .ThenByDescending(c => c.PorDefecto)
                .ThenBy(c => c.TipoDeProducto!.Nombre)
                .ThenBy(c => c.TipoDeElementoId)
                .ThenBy(c => c.SucursalId)
                .ToListAsync();
        }

        public async Task<CheckList?> GetCheckListWithDetailsAsync(int id)
        {
            return await _context.CheckLists
                .Include(c => c.TipoDeProducto)
                .Include(c => c.TipoDeElemento)
                .Include(c => c.Sucursal)
                .Include(c => c.Detalles!)
                    .ThenInclude(d => d.TipoDeDato)
                .FirstOrDefaultAsync(c => c.Id == id && c.Activo);
        }

        public async Task<IEnumerable<CheckList>> GetCheckListsByTipoProductoAsync(int tipoProductoId)
        {
            return await _context.CheckLists
                .Include(c => c.TipoDeProducto)
                .Include(c => c.TipoDeElemento)
                .Include(c => c.Sucursal)
                .Where(c => c.TipoDeProductoId == tipoProductoId && c.Activo)
                .OrderByDescending(c => c.PorDefecto)
                .ThenBy(c => c.TipoDeElementoId)
                .ThenBy(c => c.SucursalId)
                .ToListAsync();
        }

        public async Task<IEnumerable<CheckList>> GetCheckListsBySucursalAsync(int sucursalId)
        {
            return await _context.CheckLists
                .Include(c => c.TipoDeProducto)
                .Include(c => c.TipoDeElemento)
                .Include(c => c.Sucursal)
                .Where(c => c.SucursalId == sucursalId && c.Activo)
                .OrderBy(c => c.TipoDeProducto!.Nombre)
                .ThenBy(c => c.TipoDeElementoId)
                .ToListAsync();
        }

        public async Task<IEnumerable<CheckList>> GetCheckListsPorDefectoAsync()
        {
            return await _context.CheckLists
                .Include(c => c.TipoDeProducto)
                .Include(c => c.TipoDeElemento)
                .Where(c => c.PorDefecto && c.Activo)
                .OrderBy(c => c.TipoDeProducto!.Nombre)
                .ThenBy(c => c.TipoDeElementoId)
                .ToListAsync();
        }

        public async Task<bool> ExistsActiveCheckListAsync(int tipoProductoId, int? tipoElementoId, int? clienteId, int? sucursalId, int? excludeId = null)
        {
            var query = _context.CheckLists
                .Where(c => c.TipoDeProductoId == tipoProductoId && c.Activo);

            if (tipoElementoId.HasValue)
            {
                query = query.Where(c => c.TipoDeElementoId == tipoElementoId);
            }
            else
            {
                query = query.Where(c => c.TipoDeElementoId == null);
            }

            if (clienteId.HasValue)
            {
                query = query.Where(c => c.ClienteId == clienteId);
            }
            else
            {
                query = query.Where(c => c.ClienteId == null);
            }

            if (sucursalId.HasValue)
            {
                query = query.Where(c => c.SucursalId == sucursalId);
            }
            else
            {
                query = query.Where(c => c.SucursalId == null);
            }

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId);
            }

            return await query.AnyAsync();
        }
    }
}
