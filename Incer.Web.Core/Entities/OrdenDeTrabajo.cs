using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class OrdenDeTrabajo : BaseEntity
    {
        [Required]
        public int SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }

        [Required]
        public int Numero { get; set; }

        [Required]
        public int UsuarioId { get; set; }
        public User? Usuario { get; set; }

        [Required]
        public int PrioridadId { get; set; }
        public Prioridad? Prioridad { get; set; }

        [Required]
        public int EstadoDeOTId { get; set; }
        public EstadoDeOT? EstadoDeOT { get; set; }

        [Required]
        public DateTime FechaIngreso { get; set; }

        public DateTime? FechaRecepcion { get; set; }
        public DateTime? FechaTerminacion { get; set; }
        public DateTime? FechaSalida { get; set; }
        public DateTime? FechaEntrega { get; set; }

        public int? RemitoId { get; set; }
        public Remito? Remito { get; set; }

        public string? Observaciones { get; set; }

        public virtual ICollection<OrdenDeTrabajoDetalle> Detalles { get; set; } = new List<OrdenDeTrabajoDetalle>();
    }
}
