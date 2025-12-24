using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class AuditLog : BaseEntity
    {
        [Required]
        public string Action { get; set; } = string.Empty; // 'create', 'update', 'delete', 'login', 'logout'
        
        [Required]
        public string EntityType { get; set; } = string.Empty; // 'UserAppAccess', 'UserCenterAppAccess', 'App', etc.
        
        public int? EntityId { get; set; }
        
        [Required]
        public int UserId { get; set; } // Usuario que realizó la acción
        
        [Required]
        public string UserEmail { get; set; } = string.Empty;
        
        [Required]
        public string Details { get; set; } = string.Empty; // JSON con detalles del cambio
        
        [Required]
        public string IpAddress { get; set; } = string.Empty;
        
        [Required]
        public string UserAgent { get; set; } = string.Empty;
        
        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public string? OldValues { get; set; } // JSON con valores anteriores
        
        public string? NewValues { get; set; } // JSON con valores nuevos
        
        public bool Success { get; set; } = true;
        
        public string? ErrorMessage { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
    }
}
