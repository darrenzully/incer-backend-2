namespace Incer.Web.Core.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime? FechaUpdate { get; set; }
        public string UsuarioCreacion { get; set; } = "system";
        public string UsuarioUpdate { get; set; } = "system";
    }
} 