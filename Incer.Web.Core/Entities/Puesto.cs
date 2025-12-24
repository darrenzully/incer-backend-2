using System;

namespace Incer.Web.Core.Entities
{
    public class Puesto : BaseEntity
    {
        public int SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }
        public int? ExtintorId { get; set; }
        public Extintor? Extintor { get; set; }
        public string? Nombre { get; set; }
        public string? Ubicacion { get; set; }
        public string? Codigo { get; set; }
        public int? QRId { get; set; }
        public QR? QR { get; set; }
        public bool Deshabilitado { get; set; }
        public DateTime? FechaDeshabilitacion { get; set; }
        public string? UltimoRelevamiento { get; set; }
    }
}
