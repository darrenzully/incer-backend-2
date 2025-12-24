using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class TipoDatoRepository : Repository<TipoDeDato>, ITipoDatoRepository
    {
        public TipoDatoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<TipoDeDato?> GetByNombreAsync(string nombre)
        {
            return await _context.TiposDato
                .FirstOrDefaultAsync(td => td.Nombre == nombre);
        }
    }
}