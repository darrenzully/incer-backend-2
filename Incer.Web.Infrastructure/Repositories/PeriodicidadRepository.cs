using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class PeriodicidadRepository : Repository<Periodicidad>, IPeriodicidadRepository
    {
        public PeriodicidadRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }
    }
} 