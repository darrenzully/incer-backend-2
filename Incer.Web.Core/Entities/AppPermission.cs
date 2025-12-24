using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class AppPermission : BaseEntity
    {
        [Required]
        public int PermissionId { get; set; }
        
        [Required]
        public int AppId { get; set; }
        
        public bool Active { get; set; } = true;
        
        // Navigation properties
        public virtual Permission Permission { get; set; } = null!;
        public virtual App Application { get; set; } = null!;
    }
}
