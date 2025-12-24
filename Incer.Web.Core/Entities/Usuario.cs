using System.Collections.Generic;

namespace Incer.Web.Core.Entities
{
    public class User : BaseEntity
    {
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Mail { get; set; }
        public string? Alias { get; set; }
        public string? Clave { get; set; }
        public byte[]? Foto { get; set; }
        public int RoleId { get; set; }
        public Role? Role { get; set; }
        
        // Relaciones de acceso
        public virtual ICollection<UserAppAccess> UserAppAccesses { get; set; } = new List<UserAppAccess>();
        public virtual ICollection<UserCenterAppAccess> UserCenterAppAccesses { get; set; } = new List<UserCenterAppAccess>();
        
        // Relaciones de historial de tareas
        public virtual ICollection<TareaEstadoHistoria> TareaEstadoHistorias { get; set; } = new List<TareaEstadoHistoria>();
        public virtual ICollection<TareaEstadoHistoria> TareaEstadoHistoriaEstablecidas { get; set; } = new List<TareaEstadoHistoria>();
        
        // Campos de auditoría
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; } = true;
    }

} 