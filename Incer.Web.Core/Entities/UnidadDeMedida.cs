namespace Incer.Web.Core.Entities
{
    public class UnidadDeMedida : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Simbolo { get; set; }
        public string? Descripcion { get; set; }
    }
}
