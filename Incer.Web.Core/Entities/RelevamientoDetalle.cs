using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Incer.Web.Core.Entities
{
    public class RelevamientoDetalle : BaseEntity
    {
        public int Id { get; set; }

        public required float Latitud { get; set; }
        public required float Longitud { get; set; }
        public string? Observaciones { get; set; }

        //Producto puede ser Extintor o Instalación fija. De acuerdo el "TipoProductoId" del relevamiento.
        public required int ProductoId { get; set; }

        public required int RelevamientoId { get; set; }
        public Relevamiento? Relevamiento { get; set; }

        public int? PuestoId { get; set; }
        public Puesto? Puesto { get; set; }

        public int? ArchivoId { get; set; }
        public Archivo? Archivo { get; set; }

        [NotMapped]
        public Extintor? Extintor { get; set; }
        [NotMapped]
        public Elemento? Elemento { get; set; }

        public IList<RelevamientoDetalleResultado>? DetalleResultados { get; set; }
        public IList<RelevamientoDetalleFoto>? DetalleFotos { get; set; }
    }
}