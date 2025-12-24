using System.Threading.Tasks;
using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IRoleAccessService
    {
        /// <summary>
        /// Aplica automáticamente todos los accesos del rol a un usuario
        /// </summary>
        Task ApplyRoleAccessToUserAsync(int userId, int roleId, int grantedBy);
        
        /// <summary>
        /// Remueve todos los accesos del rol de un usuario
        /// </summary>
        Task RemoveRoleAccessFromUserAsync(int userId, int roleId);
        
        /// <summary>
        /// Obtiene todos los accesos que un rol tiene configurados
        /// </summary>
        Task<object> GetRoleAccessTemplateAsync(int roleId);
        
        /// <summary>
        /// Actualiza la plantilla de accesos de un rol
        /// </summary>
        Task UpdateRoleAccessTemplateAsync(int roleId, object accessTemplate);

        /// <summary>
        /// Crea un acceso a aplicación para un rol
        /// </summary>
        Task<RoleAppAccess> CreateRoleAppAccessAsync(int roleId, int appId, string accessLevel);

        /// <summary>
        /// Crea un acceso a centro para un rol
        /// </summary>
        Task<RoleCenterAccess> CreateRoleCenterAccessAsync(int roleId, int businessCenterId, string accessLevel, bool isDefault);
    }
}
