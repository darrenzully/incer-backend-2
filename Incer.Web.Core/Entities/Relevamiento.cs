using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Relevamiento : BaseEntity
    {
        [Required]
        public int TipoDeProductoId { get; set; }
        public TipoDeProducto? TipoDeProducto { get; set; }

        [Required]
        public int SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }

        public int? TipoDeElementoId { get; set; }
        public TipoDeElemento? TipoDeElemento { get; set; }

        [Required]
        public int CheckListId { get; set; }
        public CheckList? CheckList { get; set; }

        [Required]
        public int TareaId { get; set; }
        public Tarea? Tarea { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        public DateTime? FechaFin { get; set; }

        public string? Leyenda { get; set; }

        public string? Descripcion { get; set; }

        public DateTime? FechaRecepcion { get; set; }

        [Required]
        public int EstadoTareaId { get; set; }
        public EstadoTarea? EstadoTarea { get; set; }

        [Required]
        public int UsuarioId { get; set; }
        public User? Usuario { get; set; }

        public int? RemitoId { get; set; }
        public Remito? Remito { get; set; }

        public virtual ICollection<RelevamientoDetalle> RelevamientoDetalles { get; set; } = new List<RelevamientoDetalle>();
        public virtual ICollection<TareaEstadoHistoria> TareaEstadoHistorias { get; set; } = new List<TareaEstadoHistoria>();
    }
}