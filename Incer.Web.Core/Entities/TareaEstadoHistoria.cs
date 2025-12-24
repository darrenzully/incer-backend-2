using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class TareaEstadoHistoria : BaseEntity
    {
        public string? Descripcion { get; set; }

        [Required]
        public int TareaId { get; set; }
        public Tarea? Tarea { get; set; }

        [Required]
        public int EstadoTareaId { get; set; }
        public EstadoTarea? EstadoTarea { get; set; }

        public int? RelevamientoId { get; set; }
        public Relevamiento? Relevamiento { get; set; }

        // Fecha y usuario en que se modifica la tarea/relevamiento
        [Required]
        public DateTime Fecha { get; set; }
        
        [Required]
        public int UsuarioId { get; set; }
        public User? Usuario { get; set; }

        // Fecha y usuario que se establece para el nuevo estado de la tarea/relevamiento
        [Required]
        public DateTime FechaEstablecida { get; set; }
        
        [Required]
        public int UsuarioIdEstablecido { get; set; }
        public User? UsuarioEstablecido { get; set; }
    }
}

