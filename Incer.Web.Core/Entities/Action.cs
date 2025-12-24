using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Action : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // "create", "read", "update", "delete", "list", etc.
        
        [Required]
        public int AppId { get; set; }
        public virtual App App { get; set; } = null!;
        
        public bool IsSystem { get; set; } = false;
        
        // Relaciones
        public virtual ICollection<Permission> Permissions { get; set; } = new List<Permission>();
        public virtual ICollection<UserPermissionMatrix> UserPermissionMatrices { get; set; } = new List<UserPermissionMatrix>();
    }
}
