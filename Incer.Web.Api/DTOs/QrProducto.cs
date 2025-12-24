namespace Incer.Web.Api.DTOs
{
    public class QrProducto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Cliente { get; set; } = string.Empty;
        public string Sucursal { get; set; } = string.Empty;
        public string TipoProducto { get; set; } = string.Empty;
        public string? TipoElemento { get; set; }
        public string Producto { get; set; } = string.Empty;
        public string? Puesto { get; set; }
        public string? TextoImpresion { get; set; }
    }
}


