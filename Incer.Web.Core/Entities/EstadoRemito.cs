using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class EstadoRemito : BaseEntity
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Remito>? Remitos { get; set; }
    }
}
