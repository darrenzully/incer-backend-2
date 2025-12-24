using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class OrdenDeTrabajoDetalle : BaseEntity
    {
        [Required]
        public int OrdenDeTrabajoId { get; set; }
        public OrdenDeTrabajo? OrdenDeTrabajo { get; set; }

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        public int Cantidad { get; set; }

        [Required]
        public decimal Precio { get; set; }

        [Required]
        public decimal Total { get; set; }
    }
}
