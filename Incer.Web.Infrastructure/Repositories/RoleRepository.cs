using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories {
  public class RoleRepository : Repository<Role>, IRoleRepository {
    public RoleRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
    {
    }

    public override async Task<IEnumerable<Role>> GetAllAsync() {
      return await _context.Roles
        .Where(r => r.Activo)
        .OrderBy(r => r.Priority)
        .ThenBy(r => r.Name)
        .ToListAsync();
    }
    
    public override async Task<Role?> GetByIdAsync(int id) {
      return await _context.Roles
        .FirstOrDefaultAsync(r => r.Id == id && r.Activo);
    }

    public async Task<Role?> GetByNameAsync(string name) {
      return await _context.Roles
        .FirstOrDefaultAsync(r => r.Name == name && r.Activo);
    }

    public async Task<IEnumerable<Role>> GetByPriorityAsync(int minPriority) {
      return await _context.Roles
        .Where(r => r.Priority >= minPriority && r.Activo)
        .OrderBy(r => r.Priority)
        .ThenBy(r => r.Name)
        .ToListAsync();
    }

    public async Task<IEnumerable<Role>> GetSystemRolesAsync() {
      return await _context.Roles
        .Where(r => r.IsSystem && r.Activo)
        .OrderBy(r => r.Priority)
        .ThenBy(r => r.Name)
        .ToListAsync();
    }

    public async Task<Role?> GetByIdWithPermissionsAsync(int id) {
      return await _context.Roles
        .Include(r => r.RolePermissions)
        .ThenInclude(rp => rp.Permission)
        .FirstOrDefaultAsync(r => r.Id == id && r.Activo);
    }

    public async Task<IEnumerable<Role>> GetAllWithPermissionsAsync() {
      return await _context.Roles
        .Include(r => r.RolePermissions)
        .ThenInclude(rp => rp.Permission)
        .Where(r => r.Activo)
        .OrderBy(r => r.Priority)
        .ThenBy(r => r.Name)
        .ToListAsync();
    }
  }
} 