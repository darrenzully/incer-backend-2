using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class ExtintorHistoria : BaseEntity
    {
        [Required]
        public int ExtintorId { get; set; }
        public Extintor? Extintor { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        public int? PuestoId { get; set; }
        public Puesto? Puesto { get; set; }

        public int? SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }

        [Required]
        public float Latitud { get; set; }

        [Required]
        public float Longitud { get; set; }

        public string? Descripcion { get; set; }
    }
}

