using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class UserClientAccess : BaseEntity
    {
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ClienteId { get; set; }
        
        [Required]
        public int AppId { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string AccessLevel { get; set; } = string.Empty; // 'full', 'read', 'limited'
        
        [Required]
        public DateTime GrantedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ExpiresAt { get; set; }
        
        [Required]
        public int GrantedBy { get; set; }
        
        public bool Active { get; set; } = true;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Cliente Cliente { get; set; } = null!;
        public virtual App Application { get; set; } = null!;
    }
}

