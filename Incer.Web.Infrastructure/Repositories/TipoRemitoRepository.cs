using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class TipoRemitoRepository : Repository<TipoRemito>, ITipoRemitoRepository
    {
        public TipoRemitoRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }
    }
}
