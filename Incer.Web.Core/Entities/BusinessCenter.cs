using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class BusinessCenter : BaseEntity
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public bool Activo { get; set; } = true;
        
        // Relaciones de negocio
        public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
        public virtual ICollection<Sucursal> Sucursales { get; set; } = new List<Sucursal>();
        public virtual ICollection<Puesto> Puestos { get; set; } = new List<Puesto>();
        public virtual ICollection<Elemento> Elementos { get; set; } = new List<Elemento>();
        public virtual ICollection<Extintor> Extintores { get; set; } = new List<Extintor>();
        
        // Relaciones de seguridad
        public virtual ICollection<UserCenterAppAccess> UserCenterAppAccesses { get; set; } = new List<UserCenterAppAccess>();
    }
}
