using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class RolePermission : BaseEntity
    {
        public int RoleId { get; set; }
        public int PermissionId { get; set; }
        public bool IsGranted { get; set; } = true; // true = permitir, false = denegar
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
        public int GrantedBy { get; set; }
        
        // Relaciones
        public virtual Role Role { get; set; } = null!;
        public virtual Permission Permission { get; set; } = null!;
        public virtual User GrantedByUser { get; set; } = null!;
    }
}
