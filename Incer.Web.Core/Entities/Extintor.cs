using System;
using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Extintor : BaseEntity
    {
        public int? SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }
        public int? ClienteId { get; set; }
        public Cliente? Cliente { get; set; }
        [Required(ErrorMessage = "El tipo de carga es obligatorio")]
        public int TipoDeCargaId { get; set; }
        public TipoDeCarga? TipoDeCarga { get; set; }
        [Required(ErrorMessage = "La capacidad es obligatoria")]
        public int CapacidadId { get; set; }
        public Capacidad? Capacidad { get; set; }
        [Required(ErrorMessage = "La fecha de vencimiento de carga es obligatoria")]
        public DateTime VencimientoCarga { get; set; }
        [Required(ErrorMessage = "La fecha de vencimiento PH es obligatoria")]
        public DateTime VencimientoPH { get; set; }
        public int? Interno { get; set; }
        [Required(ErrorMessage = "El orden es obligatorio")]
        public int Orden { get; set; }
        public string? Ubicacion { get; set; }
        public string? Codigo { get; set; }
        public string? NroSerie { get; set; }
        public int? FabricanteId { get; set; }
        public Fabricante? Fabricante { get; set; }
        public string? NroFabricante { get; set; }
        public int? Año { get; set; }
        [Required(ErrorMessage = "La fecha de incorporación es obligatoria")]
        public DateTime Incorporacion { get; set; }
        public string? Etiqueta { get; set; }
        public string? IRAM { get; set; }
        public bool Reserva { get; set; }
        public bool Baja { get; set; }
        public string? ObservacionBaja { get; set; }
        public int? QRId { get; set; }
        public QR? QR { get; set; }
        public DateTime? FechaRecepcion { get; set; }
    }
}
