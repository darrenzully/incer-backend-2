namespace Incer.Web.Core.Entities
{
    public class AlcanceDetalle : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int TipoDeProductoId { get; set; }
        public TipoDeProducto? TipoDeProducto { get; set; }

    }
} 