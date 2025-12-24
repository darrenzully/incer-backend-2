using System.ComponentModel.DataAnnotations.Schema;

namespace Incer.Web.Core.Entities
{
    public class CheckList : BaseEntity
    {
        public bool PorDefecto { get; set; }
        public int Version { get; set; }

        public int TipoDeProductoId { get; set; }
        public TipoDeProducto? TipoDeProducto { get; set; }

        public int? TipoDeElementoId { get; set; }
        public TipoDeElemento? TipoDeElemento { get; set; }

        public int? SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }

        public int? ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        [NotMapped]
        public List<CheckListDetalle>? Detalles { get; set; }

        // Navigation properties for related entities
        public ICollection<Relevamiento>? Relevamientos { get; set; }
    }
}
