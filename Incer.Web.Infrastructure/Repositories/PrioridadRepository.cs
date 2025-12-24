using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Infrastructure.Repositories
{
    public class PrioridadRepository : Repository<Prioridad>, IPrioridadRepository
    {
        public PrioridadRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }
    }
}
