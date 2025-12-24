using System.Collections.Generic;

namespace Incer.Web.Core.Entities 
{
    public class Role : BaseEntity 
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsSystem { get; set; } = false; // Roles del sistema que no se pueden modificar
        public int Priority { get; set; } = 0;      // Prioridad para resolución de conflictos
        
        // Relaciones
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        
        // Nuevas relaciones para accesos automáticos del rol
        public virtual ICollection<RoleAppAccess> RoleAppAccesses { get; set; } = new List<RoleAppAccess>();
        public virtual ICollection<RoleCenterAccess> RoleCenterAccesses { get; set; } = new List<RoleCenterAccess>();
    }
} 