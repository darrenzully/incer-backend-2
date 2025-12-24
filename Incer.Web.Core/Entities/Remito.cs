using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Remito : BaseEntity
    {
        public int? RemitoUsuarioId { get; set; }
        public RemitoUsuario? RemitoUsuario { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        public DateTime? FechaRecepcion { get; set; }

        public string? Letra { get; set; }
        public string? Secuencia { get; set; }

        [Required]
        public int Numero { get; set; }

        [Required]
        public int EstadoRemitoId { get; set; }
        public EstadoRemito? EstadoRemito { get; set; }

        [Required]
        public int ChoferId { get; set; }
        public User? Chofer { get; set; }

        [Required]
        public int SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }

        public int? RemitoManualId { get; set; }
        public Archivo? RemitoManual { get; set; }

        public int? RemitoOficialId { get; set; }
        public Archivo? RemitoOficial { get; set; }

        public DateTime? FechaRemitoOficial { get; set; }
        public int? NumeroRemitoOficial { get; set; }

        public DateTime? FechaFactura { get; set; }
        public int? NumeroFactura { get; set; }

        public bool NoFacturable { get; set; }

        public string? Descripcion { get; set; }

        public byte[]? FirmaOperador { get; set; }
        public byte[]? FirmaEncargado { get; set; }

        public ICollection<PresupuestoRemito>? PresupuestosRemitos { get; set; }
    }
}
