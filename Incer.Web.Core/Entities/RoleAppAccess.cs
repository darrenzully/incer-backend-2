using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class RoleAppAccess : BaseEntity
    {
        [Required]
        public int RoleId { get; set; }
        
        [Required]
        public int AppId { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string AccessLevel { get; set; } = string.Empty; // 'full', 'limited', 'readonly'
        
        [Required]
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ExpiresAt { get; set; }
        
        [Required]
        public int GrantedBy { get; set; }
        
        public bool Active { get; set; } = true;
        
        // Navigation properties
        public virtual Role Role { get; set; } = null!;
        public virtual App Application { get; set; } = null!;
        public virtual User GrantedByUser { get; set; } = null!;
    }
}
