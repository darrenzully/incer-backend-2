using System.Collections.Generic;

namespace Incer.Web.Core.Entities
{
    public class Elemento : BaseEntity
    {
        public int TipoDeElementoId { get; set; }
        public TipoDeElemento? TipoDeElemento { get; set; }
        public int SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }
        public string? Ubicacion { get; set; }
        public string? Codigo { get; set; }
        public int? QRId { get; set; }
        public QR? QR { get; set; }
        public int Interno { get; set; }
        public string? UltimoRelevamiento { get; set; }
        public List<ElementoTipoElementoDetalle>? Detalles { get; set; }
    }
}
