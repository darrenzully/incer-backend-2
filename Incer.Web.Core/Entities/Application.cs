using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class App : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty; // 'web', 'mobile-internal', 'mobile-external'
        
        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = string.Empty; // 'web', 'mobile', 'api'
        
        [MaxLength(20)]
        public string? Platform { get; set; } // 'ios', 'android', 'web'
        
        public bool Active { get; set; } = true;
        
        [Required]
        [MaxLength(20)]
        public string Version { get; set; } = "1.0.0";
        
        // Navigation properties
        public virtual ICollection<UserAppAccess> UserAppAccesses { get; set; } = new List<UserAppAccess>();
        public virtual ICollection<AppPermission> AppPermissions { get; set; } = new List<AppPermission>();
    }
}
