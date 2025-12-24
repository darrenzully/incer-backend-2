using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class TipoDeElemento : BaseEntity
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;
        
        // Navigation properties
        public virtual ICollection<TipoDeElementoDetalle> Detalles { get; set; } = new List<TipoDeElementoDetalle>();
        public virtual ICollection<CheckList> CheckLists { get; set; } = new List<CheckList>();
        public virtual ICollection<Relevamiento> Relevamientos { get; set; } = new List<Relevamiento>();
        public virtual ICollection<Tarea> Tareas { get; set; } = new List<Tarea>();
    }
}