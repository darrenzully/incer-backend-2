using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories {
  public class UserRepository : Repository<User>, IUserRepository {
    public UserRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
    {
    }

    public override async Task<IEnumerable<User>> GetAllAsync() {
      return await _context.Users
        .Where(u => u.Activo)
        .OrderBy(u => u.Apellido)
        .ThenBy(u => u.Nombre)
        .ToListAsync();
    }
    
    public override async Task<User?> GetByIdAsync(int id) {
      return await _context.Users
        .FirstOrDefaultAsync(u => u.Id == id && u.Activo);
    }

    public async Task<User?> GetByAliasAsync(string alias) {
      return await _context.Users
        .FirstOrDefaultAsync(u => u.Alias == alias && u.Activo);
    }

    public async Task<User?> GetByEmailAsync(string email) {
      return await _context.Users
        .FirstOrDefaultAsync(u => u.Mail == email && u.Activo);
    }

    public async Task<IEnumerable<User>> GetByRoleIdAsync(int roleId) {
      return await _context.Users
        .Where(u => u.RoleId == roleId && u.Activo)
        .OrderBy(u => u.Apellido)
        .ThenBy(u => u.Nombre)
        .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetByBusinessCenterIdAsync(int businessCenterId) {
      return await _context.Users
        .Where(u => u.Activo)
        .OrderBy(u => u.Apellido)
        .ThenBy(u => u.Nombre)
        .ToListAsync();
    }

    public async Task<User?> GetByIdWithRoleAsync(int id) {
      return await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Id == id && u.Activo);
    }

    public async Task<IEnumerable<User>> GetAllWithRoleAsync() {
      return await _context.Users
        .Include(u => u.Role)
        .Where(u => u.Activo)
        .OrderBy(u => u.Apellido)
        .ThenBy(u => u.Nombre)
        .ToListAsync();
    }

    public async Task<User?> GetByAliasWithRoleAsync(string alias) {
      return await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Alias == alias && u.Activo);
    }

    public async Task<User?> GetByEmailWithRoleAsync(string email) {
      return await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Mail == email && u.Activo);
    }

    public async Task<IEnumerable<User>> GetByRoleIdWithRoleAsync(int roleId) {
      return await _context.Users
        .Include(u => u.Role)
        .Where(u => u.RoleId == roleId && u.Activo)
        .OrderBy(u => u.Apellido)
        .ThenBy(u => u.Nombre)
        .ToListAsync();
    }
  }
} 