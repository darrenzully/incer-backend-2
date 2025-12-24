namespace Incer.Web.Core.Entities
{
    public class Fabricante : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }
}
