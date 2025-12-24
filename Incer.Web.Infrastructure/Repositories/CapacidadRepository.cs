using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class CapacidadRepository : Repository<Capacidad>, ICapacidadRepository
    {
        public CapacidadRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }
    }
}
