using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Tarea : BaseEntity
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;

        public string? Descripcion { get; set; }

        [Required]
        public int SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }

        public int? PresupuestoId { get; set; }
        public Presupuesto? Presupuesto { get; set; }

        public int? ContactoId { get; set; }
        public Contacto? Contacto { get; set; }

        [Required]
        public int TipoDeTareaId { get; set; }
        public TipoTarea? TipoDeTarea { get; set; }

        public int? TipoSolicitudId { get; set; }

        public int? PeriodicidadId { get; set; }
        public Periodicidad? Periodicidad { get; set; }

        public int? PrioridadId { get; set; }
        public Prioridad? Prioridad { get; set; }

        public int? TipoDeProductoId { get; set; }
        public TipoDeProducto? TipoDeProducto { get; set; }

        public int? TipoDeElementoId { get; set; }
        public TipoDeElemento? TipoDeElemento { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        public DateTime? FechaFin { get; set; }

        public DateTime? FechaRecepcion { get; set; }

        [Required]
        public int EstadoTareaId { get; set; }
        public EstadoTarea? EstadoTarea { get; set; }

        [Required]
        public int UsuarioId { get; set; }
        public User? Usuario { get; set; }

        public int Duracion { get; set; }
        public int Frecuencia { get; set; }

        public int? ArchivoId { get; set; }
        public Archivo? Archivo { get; set; }

        public int? RemitoId { get; set; }
        public Remito? Remito { get; set; }

        public virtual ICollection<TareaDetalle> TareaDetalles { get; set; } = new List<TareaDetalle>();
        public virtual ICollection<TareaEstadoHistoria> EstadosHistoria { get; set; } = new List<TareaEstadoHistoria>();
    }
}