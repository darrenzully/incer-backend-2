using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Api.DTOs
{
    public class TareaCreateRequest
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;
        
        public string? Descripcion { get; set; }
        
        [Required]
        public int SucursalId { get; set; }
        
        public int? ClienteId { get; set; }
        
        public int? PresupuestoId { get; set; }
        
        public int? ContactoId { get; set; }
        
        [Required]
        public int TipoDeTareaId { get; set; }
        
        public int? TipoSolicitudId { get; set; }
        
        public int? PeriodicidadId { get; set; }
        
        public int? PrioridadId { get; set; }
        
        public int? TipoDeProductoId { get; set; }
        
        public int? TipoDeElementoId { get; set; }
        
        [Required]
        public DateTime Fecha { get; set; }
        
        public DateTime? FechaFin { get; set; }
        
        public DateTime? FechaRecepcion { get; set; }
        
        [Required]
        public int EstadoTareaId { get; set; }
        
        [Required]
        public int UsuarioId { get; set; }
        
        [Required]
        public int Duracion { get; set; }
        
        [Required]
        public int Frecuencia { get; set; }
        
        public int? ArchivoId { get; set; }
        
        public int? RemitoId { get; set; }
        
        [Required]
        public bool Activo { get; set; } = true;
    }
}
