using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class TipoTarea : BaseEntity
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;
        
        [Required]
        public string Descripcion { get; set; } = string.Empty;
        
        public virtual ICollection<Tarea>? Tareas { get; set; }
    }
}
