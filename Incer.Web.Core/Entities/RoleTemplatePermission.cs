namespace Incer.Web.Core.Entities
{
    public class RoleTemplatePermission : BaseEntity
    {
        public int RoleTemplateId { get; set; }
        public int PermissionId { get; set; }
        
        // Navigation properties
        public virtual RoleTemplate RoleTemplate { get; set; } = null!;
        public virtual Permission Permission { get; set; } = null!;
    }
}
