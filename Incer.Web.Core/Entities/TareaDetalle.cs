using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class TareaDetalle : BaseEntity
    {
        public int TareaId { get; set; }
        public Tarea? Tarea { get; set; }

        [Required]
        public string Descripcion { get; set; } = string.Empty;

        public DateTime Fecha { get; set; }

        public int UsuarioId { get; set; }
        public User? Usuario { get; set; }
    }
}