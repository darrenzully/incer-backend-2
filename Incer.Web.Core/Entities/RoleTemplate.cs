using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class RoleTemplate : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // 'system', 'business', 'custom'
        
        public bool IsSystem { get; set; } = false;
        
        public int Priority { get; set; } = 0;
        
        public bool Active { get; set; } = true;
        
        // Navigation properties
        public virtual ICollection<RoleTemplatePermission> RoleTemplatePermissions { get; set; } = new List<RoleTemplatePermission>();
    }
}
