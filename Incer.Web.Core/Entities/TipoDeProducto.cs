namespace Incer.Web.Core.Entities
{
    public class TipoDeProducto : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }

        // Navigation properties for related entities
        public ICollection<CheckList>? CheckLists { get; set; }
        public ICollection<Relevamiento>? Relevamientos { get; set; }
        public ICollection<Tarea>? Tareas { get; set; }
    }
}
