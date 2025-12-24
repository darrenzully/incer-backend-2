using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class EstadoDeOT : BaseEntity
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }
    }
}
