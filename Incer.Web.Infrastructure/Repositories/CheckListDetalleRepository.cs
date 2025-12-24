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
    public class CheckListDetalleRepository : Repository<CheckListDetalle>, ICheckListDetalleRepository
    {
        public CheckListDetalleRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public override async Task<IEnumerable<CheckListDetalle>> GetAllAsync()
        {
            return await _context.CheckListDetalles
                .Include(d => d.CheckList)
                .Include(d => d.TipoDeDato)
                .OrderBy(d => d.Orden)
                .ToListAsync();
        }

        public override async Task<CheckListDetalle?> GetByIdAsync(int id)
        {
            return await _context.CheckListDetalles
                .Include(d => d.CheckList)
                .Include(d => d.TipoDeDato)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<CheckListDetalle>> GetDetallesByCheckListIdAsync(int checkListId)
        {
            return await _context.CheckListDetalles
                .Include(d => d.TipoDeDato)
                .Where(d => d.CheckListId == checkListId)
                .OrderBy(d => d.Orden)
                .ToListAsync();
        }

        public async Task<IEnumerable<CheckListDetalle>> GetDetallesWithTipoDatoAsync(int checkListId)
        {
            return await _context.CheckListDetalles
                .Include(d => d.TipoDeDato)
                .Where(d => d.CheckListId == checkListId)
                .OrderBy(d => d.Orden)
                .ToListAsync();
        }
    }
}
