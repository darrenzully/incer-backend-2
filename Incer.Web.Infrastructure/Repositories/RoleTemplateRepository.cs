using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class RoleTemplateRepository : Repository<RoleTemplate>, IRoleTemplateRepository
    {
        public RoleTemplateRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<RoleTemplate?> GetByNameAsync(string name)
        {
            return await _context.RoleTemplates
                .FirstOrDefaultAsync(rt => rt.Name == name && rt.Activo);
        }

        public async Task<IEnumerable<RoleTemplate>> GetActiveTemplatesAsync()
        {
            return await _context.RoleTemplates
                .Where(rt => rt.Activo)
                .OrderBy(rt => rt.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<RoleTemplate>> GetTemplatesByCategoryAsync(string category)
        {
            return await _context.RoleTemplates
                .Where(rt => rt.Category == category && rt.Activo)
                .OrderBy(rt => rt.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByTemplateIdAsync(int templateId)
        {
            return await _context.Permissions
                .Include(p => p.RoleTemplatePermissions.Where(rtp => rtp.RoleTemplateId == templateId))
                .Where(p => p.Activo)
                .ToListAsync();
        }

        public async Task<bool> AssignPermissionToTemplateAsync(int templateId, int permissionId)
        {
            try
            {
                var roleTemplatePermission = new RoleTemplatePermission
                {
                    RoleTemplateId = templateId,
                    PermissionId = permissionId,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                _context.RoleTemplatePermissions.Add(roleTemplatePermission);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemovePermissionFromTemplateAsync(int templateId, int permissionId)
        {
            try
            {
                var roleTemplatePermission = await _context.RoleTemplatePermissions
                    .FirstOrDefaultAsync(rtp => rtp.RoleTemplateId == templateId && rtp.PermissionId == permissionId);

                if (roleTemplatePermission != null)
                {
                    roleTemplatePermission.Activo = false;
                    roleTemplatePermission.FechaUpdate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<Role?> CreateRoleFromTemplateAsync(int templateId, string roleName, string roleDescription)
        {
            try
            {
                var template = await _context.RoleTemplates
                    .Include(rt => rt.RoleTemplatePermissions)
                    .FirstOrDefaultAsync(rt => rt.Id == templateId);

                if (template == null)
                    return null;

                // Crear el nuevo rol
                var role = new Role
                {
                    Name = roleName,
                    Description = roleDescription,
                    IsSystem = false,
                    Priority = template.Priority,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                _context.Roles.Add(role);
                await _context.SaveChangesAsync();

                // Asignar permisos del template al rol
                foreach (var templatePermission in template.RoleTemplatePermissions.Where(rtp => rtp.Activo))
                {
                    var rolePermission = new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = templatePermission.PermissionId,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    };

                    _context.RolePermissions.Add(rolePermission);
                }

                await _context.SaveChangesAsync();
                return role;
            }
            catch
            {
                return null;
            }
        }
    }
}
