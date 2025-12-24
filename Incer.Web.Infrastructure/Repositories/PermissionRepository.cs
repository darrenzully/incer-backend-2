using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories {
  public class PermissionRepository : Repository<Permission>, IPermissionRepository {
    public PermissionRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
    {
    }

    public override async Task<IEnumerable<Permission>> GetAllAsync() {
      return await _context.Permissions
        .Where(p => p.Activo)
        .OrderBy(p => p.Name)
        .ToListAsync();
    }
    
    public override async Task<Permission?> GetByIdAsync(int id) {
      return await _context.Permissions
        .FirstOrDefaultAsync(p => p.Id == id && p.Activo);
    }

    public async Task<Permission?> GetByNameAsync(string name) {
      return await _context.Permissions
        .FirstOrDefaultAsync(p => p.Name == name && p.Activo);
    }

    public async Task<IEnumerable<Permission>> GetByResourceAsync(string resource) {
      return await _context.Permissions
        .Where(p => p.Resource == resource && p.Activo)
        .OrderBy(p => p.Name)
        .ToListAsync();
    }

    public async Task<IEnumerable<Permission>> GetByScopeAsync(string scope) {
      return await _context.Permissions
        .Where(p => p.Scope == scope && p.Activo)
        .OrderBy(p => p.Name)
        .ToListAsync();
    }
  }
} 