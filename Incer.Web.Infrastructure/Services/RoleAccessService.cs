using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Infrastructure.Services
{
    public class RoleAccessService : IRoleAccessService
    {
        private readonly ApplicationDbContext _context;
        private readonly IUserRepository _userRepository;

        public RoleAccessService(ApplicationDbContext context, IUserRepository userRepository)
        {
            _context = context;
            _userRepository = userRepository;
        }

        public async Task ApplyRoleAccessToUserAsync(int userId, int roleId, int grantedBy)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new ArgumentException($"Usuario con ID {userId} no encontrado");

            var role = await _context.Roles
                .Include(r => r.RoleAppAccesses)
                .Include(r => r.RoleCenterAccesses)
                .FirstOrDefaultAsync(r => r.Id == roleId && r.Activo);

            if (role == null)
                throw new ArgumentException($"Rol con ID {roleId} no encontrado");

            // Aplicar accesos a aplicaciones del rol
            foreach (var roleAppAccess in role.RoleAppAccesses.Where(raa => raa.Active))
            {
                var existingAccess = await _context.UserAppAccesses
                    .FirstOrDefaultAsync(uaa => uaa.UserId == userId && uaa.AppId == roleAppAccess.AppId);

                if (existingAccess == null)
                {
                    // Crear nuevo acceso
                    var userAppAccess = new UserAppAccess
                    {
                        UserId = userId,
                        AppId = roleAppAccess.AppId,
                        AccessLevel = roleAppAccess.AccessLevel,
                        GrantedAt = DateTime.UtcNow,
                        GrantedBy = grantedBy,
                        Active = true,
                        UsuarioCreacion = "system",
                        UsuarioUpdate = "system"
                    };
                    _context.UserAppAccesses.Add(userAppAccess);
                }
                else
                {
                    // Actualizar acceso existente
                    existingAccess.AccessLevel = roleAppAccess.AccessLevel;
                    existingAccess.Active = true;
                    existingAccess.UsuarioUpdate = "system";
                }
            }

            // Aplicar accesos a centros del rol
            foreach (var roleCenterAccess in role.RoleCenterAccesses.Where(rca => rca.Active))
            {
                var existingAccess = await _context.UserCenterAppAccesses
                    .FirstOrDefaultAsync(ucaa => ucaa.UserId == userId && 
                                               ucaa.BusinessCenterId == roleCenterAccess.BusinessCenterId && 
                                               ucaa.AppId == roleCenterAccess.AppId);

                if (existingAccess == null)
                {
                    // Crear nuevo acceso
                    var userCenterAppAccess = new UserCenterAppAccess
                    {
                        UserId = userId,
                        BusinessCenterId = roleCenterAccess.BusinessCenterId,
                        AppId = roleCenterAccess.AppId,
                        AccessLevel = roleCenterAccess.AccessLevel,
                        IsDefault = roleCenterAccess.IsDefault,
                        GrantedAt = DateTime.UtcNow,
                        GrantedBy = grantedBy,
                        Active = true,
                        UsuarioCreacion = "system",
                        UsuarioUpdate = "system"
                    };
                    _context.UserCenterAppAccesses.Add(userCenterAppAccess);
                }
                else
                {
                    // Actualizar acceso existente
                    existingAccess.AccessLevel = roleCenterAccess.AccessLevel;
                    existingAccess.IsDefault = roleCenterAccess.IsDefault;
                    existingAccess.Active = true;
                    existingAccess.UsuarioUpdate = "system";
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveRoleAccessFromUserAsync(int userId, int roleId)
        {
            var role = await _context.Roles
                .Include(r => r.RoleAppAccesses)
                .Include(r => r.RoleCenterAccesses)
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
                return;

            // Remover accesos a aplicaciones del rol
            var appIds = role.RoleAppAccesses.Select(raa => raa.AppId).ToList();
            var userAppAccesses = await _context.UserAppAccesses
                .Where(uaa => uaa.UserId == userId && appIds.Contains(uaa.AppId))
                .ToListAsync();

            foreach (var access in userAppAccesses)
            {
                access.Active = false;
                access.UsuarioUpdate = "system";
            }

            // Remover accesos a centros del rol
            var centerAppPairs = role.RoleCenterAccesses
                .Select(rca => new { rca.BusinessCenterId, rca.AppId })
                .ToList();

            var userCenterAppAccesses = await _context.UserCenterAppAccesses
                .Where(ucaa => ucaa.UserId == userId && 
                               centerAppPairs.Any(cap => cap.BusinessCenterId == ucaa.BusinessCenterId && 
                                                       cap.AppId == ucaa.AppId))
                .ToListAsync();

            foreach (var access in userCenterAppAccesses)
            {
                access.Active = false;
                access.UsuarioUpdate = "system";
            }

            await _context.SaveChangesAsync();
        }

        public async Task<object> GetRoleAccessTemplateAsync(int roleId)
        {
            var role = await _context.Roles
                .Include(r => r.RoleAppAccesses)
                    .ThenInclude(raa => raa.Application)
                .Include(r => r.RoleCenterAccesses)
                    .ThenInclude(rca => rca!.BusinessCenter)
                .Include(r => r.RoleCenterAccesses)
                    .ThenInclude(rca => rca!.Application)
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
                return null!;

            return new
            {
                role.Id,
                role.Name,
                role.Description,
                role.IsSystem,
                role.Priority,
                AppAccesses = role.RoleAppAccesses.Where(raa => raa.Active).Select(raa => new
                {
                    raa.Id,
                    raa.AppId,
                    raa.AccessLevel,
                    raa.GrantedAt,
                    raa.ExpiresAt,
                    Application = new { raa.Application.Id, raa.Application.Name, raa.Application.Code }
                }),
                CenterAccesses = role.RoleCenterAccesses.Where(rca => rca.Active).Select(rca => new
                {
                    rca.Id,
                    rca.BusinessCenterId,
                    rca.AppId,
                    rca.AccessLevel,
                    rca.IsDefault,
                    rca.GrantedAt,
                    rca.ExpiresAt,
                    BusinessCenter = new { 
                        rca.BusinessCenter.Id, 
                        rca.BusinessCenter.Name, 
                        rca.BusinessCenter.Description
                    },
                    Application = new { rca.Application.Id, rca.Application.Name, rca.Application.Code }
                })
            };
        }

        public async Task UpdateRoleAccessTemplateAsync(int roleId, object accessTemplate)
        {
            var role = await _context.Roles
                .Include(r => r.RoleAppAccesses)
                .Include(r => r.RoleCenterAccesses)
                .FirstOrDefaultAsync(r => r.Id == roleId);

            if (role == null)
                throw new ArgumentException($"Rol con ID {roleId} no encontrado");

            // Deserializar el template (en producción usar un DTO específico)
            var templateJson = System.Text.Json.JsonSerializer.Serialize(accessTemplate);
            var template = System.Text.Json.JsonSerializer.Deserialize<RoleTemplateUpdateModel>(templateJson);

            if (template == null)
                throw new ArgumentException("Formato de template inválido");

            // Actualizar accesos a aplicaciones
            if (template.AppAccesses != null)
            {
                // Remover accesos existentes
                var existingAppAccesses = role.RoleAppAccesses.ToList();
                foreach (var existing in existingAppAccesses)
                {
                    existing.Active = false;
                    existing.UsuarioUpdate = "system";
                }

                // Agregar nuevos accesos
                foreach (var appAccess in template.AppAccesses)
                {
                    var newAccess = new RoleAppAccess
                    {
                        RoleId = roleId,
                        AppId = appAccess.AppId,
                        AccessLevel = appAccess.AccessLevel,
                        GrantedAt = DateTime.UtcNow,
                        GrantedBy = 1, // Temporalmente hardcodeado
                        Active = true,
                        UsuarioCreacion = "system",
                        UsuarioUpdate = "system"
                    };
                    _context.RoleAppAccesses.Add(newAccess);
                }
            }

            // Actualizar accesos a centros
            if (template.CenterAccesses != null)
            {
                // Remover accesos existentes
                var existingCenterAccesses = role.RoleCenterAccesses.ToList();
                foreach (var existing in existingCenterAccesses)
                {
                    existing.Active = false;
                    existing.UsuarioUpdate = "system";
                }

                // Agregar nuevos accesos
                foreach (var centerAccess in template.CenterAccesses)
                {
                    var newAccess = new RoleCenterAccess
                    {
                        RoleId = roleId,
                        BusinessCenterId = centerAccess.BusinessCenterId,
                        AppId = centerAccess.AppId,
                        AccessLevel = centerAccess.AccessLevel,
                        IsDefault = centerAccess.IsDefault,
                        GrantedAt = DateTime.UtcNow,
                        GrantedBy = 1, // Temporalmente hardcodeado
                        Active = true,
                        UsuarioCreacion = "system",
                        UsuarioUpdate = "system"
                    };
                    _context.RoleCenterAccesses.Add(newAccess);
                }
            }

            await _context.SaveChangesAsync();
        }

        // Crear acceso a aplicación para un rol
        public async Task<RoleAppAccess> CreateRoleAppAccessAsync(int roleId, int appId, string accessLevel)
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                throw new ArgumentException($"Rol con ID {roleId} no encontrado");

            var app = await _context.Applications.FindAsync(appId);
            if (app == null)
                throw new ArgumentException($"Aplicación con ID {appId} no encontrada");

            var newAccess = new RoleAppAccess
            {
                RoleId = roleId,
                AppId = appId,
                AccessLevel = accessLevel,
                GrantedAt = DateTime.UtcNow,
                GrantedBy = 1, // Temporalmente hardcodeado
                Active = true,
                UsuarioCreacion = "system",
                UsuarioUpdate = "system"
            };

            _context.RoleAppAccesses.Add(newAccess);
            await _context.SaveChangesAsync();

            // Cargar la aplicación para el retorno
            newAccess.Application = app;
            return newAccess;
        }

        // Crear acceso a centro para un rol
        public async Task<RoleCenterAccess> CreateRoleCenterAccessAsync(int roleId, int businessCenterId, string accessLevel, bool isDefault)
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                throw new ArgumentException($"Rol con ID {roleId} no encontrado");

            var businessCenter = await _context.BusinessCenters.FindAsync(businessCenterId);
            if (businessCenter == null)
                throw new ArgumentException($"Centro de negocio con ID {businessCenterId} no encontrado");

            var newAccess = new RoleCenterAccess
            {
                RoleId = roleId,
                BusinessCenterId = businessCenterId,
                AppId = 0, // No se requiere appId para acceso a centro
                AccessLevel = accessLevel,
                IsDefault = isDefault,
                GrantedAt = DateTime.UtcNow,
                GrantedBy = 1, // Temporalmente hardcodeado
                Active = true,
                UsuarioCreacion = "system",
                UsuarioUpdate = "system"
            };

            _context.RoleCenterAccesses.Add(newAccess);
            await _context.SaveChangesAsync();

            // Cargar la entidad relacionada para el retorno
            newAccess.BusinessCenter = businessCenter;
            return newAccess;
        }

        // Modelo para actualización de plantillas
        private class RoleTemplateUpdateModel
        {
            public List<AppAccessUpdateModel>? AppAccesses { get; set; }
            public List<CenterAccessUpdateModel>? CenterAccesses { get; set; }
        }

        private class AppAccessUpdateModel
        {
            public int AppId { get; set; }
            public string AccessLevel { get; set; } = string.Empty;
        }

        private class CenterAccessUpdateModel
        {
            public int BusinessCenterId { get; set; }
            public int AppId { get; set; }
            public string AccessLevel { get; set; } = string.Empty;
            public bool IsDefault { get; set; }
        }
    }
}
