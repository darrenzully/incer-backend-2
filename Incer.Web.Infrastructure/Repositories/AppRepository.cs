using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class AppRepository : Repository<App>, IAppRepository
    {
        public AppRepository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor) 
            : base(context, httpContextAccessor)
        {
        }

        public async Task<App?> GetByNameAsync(string name)
        {
            return await _context.Applications
                .FirstOrDefaultAsync(a => a.Name == name && a.Activo);
        }

        public async Task<IEnumerable<App>> GetActiveAppsAsync()
        {
            return await _context.Applications
                .Where(a => a.Activo)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<App>> GetAppsByUserIdAsync(int userId)
        {
            return await _context.Applications
                .Include(a => a.UserAppAccesses.Where(uaa => uaa.UserId == userId && uaa.Activo))
                .Where(a => a.Activo)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByAppIdAsync(int appId)
        {
            return await _context.Permissions
                .Include(p => p.AppPermissions.Where(ap => ap.AppId == appId))
                .Where(p => p.Activo)
                .ToListAsync();
        }

        public async Task<bool> AssignPermissionToAppAsync(int appId, int permissionId)
        {
            try
            {
                var appPermission = new AppPermission
                {
                    AppId = appId,
                    PermissionId = permissionId,
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow
                };

                _context.AppPermissions.Add(appPermission);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemovePermissionFromAppAsync(int appId, int permissionId)
        {
            try
            {
                var appPermission = await _context.AppPermissions
                    .FirstOrDefaultAsync(ap => ap.AppId == appId && ap.PermissionId == permissionId);

                if (appPermission != null)
                {
                    appPermission.Activo = false;
                    appPermission.FechaUpdate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
