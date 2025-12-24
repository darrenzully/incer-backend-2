namespace Incer.Web.Core.Entities
{
    public class TipoDeServicio : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }
} 