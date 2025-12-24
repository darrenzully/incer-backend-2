using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    
    public class BusinessCenterRepository : Repository<BusinessCenter>, IBusinessCenterRepository
    {
        public BusinessCenterRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public override async Task<IEnumerable<BusinessCenter>> GetAllAsync()
        {
            return await _context.BusinessCenters
                .Where(bc => bc.Activo)
                .OrderBy(bc => bc.Name)
                .ToListAsync();
        }

        public override async Task<BusinessCenter?> GetByIdAsync(int id)
        {
            return await _context.BusinessCenters
                .FirstOrDefaultAsync(bc => bc.Id == id && bc.Activo);
        }
    }
} 