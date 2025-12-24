using System.Collections.Generic;

namespace Incer.Web.Core.Entities 
{
    public class Permission : BaseEntity 
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty; // 'clients', 'extintores', 'users', etc.
        public string Action { get; set; } = string.Empty;   // 'create', 'read', 'update', 'delete', 'list'
        public string Scope { get; set; } = string.Empty;    // 'global', 'center', 'own', 'hierarchy'
        public bool IsSystem { get; set; } = false;          // Permisos del sistema que no se pueden modificar
        
        // Relaciones
        public virtual ICollection<AppPermission> AppPermissions { get; set; } = new List<AppPermission>();
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
        public virtual ICollection<RoleTemplatePermission> RoleTemplatePermissions { get; set; } = new List<RoleTemplatePermission>();
    }
} 