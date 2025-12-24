using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class UserPermissionMatrix : BaseEntity
    {
        [Required]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;
        
        [Required]
        public int AppId { get; set; }
        public virtual App App { get; set; } = null!;
        
        [Required]
        public int BusinessCenterId { get; set; }
        public virtual BusinessCenter BusinessCenter { get; set; } = null!;
        
        [Required]
        public int ResourceId { get; set; }
        public virtual Resource Resource { get; set; } = null!;
        
        [Required]
        public int ActionId { get; set; }
        public virtual Action Action { get; set; } = null!;
        
        [Required]
        public PermissionType Type { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public enum PermissionType
    {
        Inherited = 0,  // Heredado del rol
        Direct = 1,     // Asignado directamente al usuario
        Denied = 2      // Explícitamente denegado
    }
}
