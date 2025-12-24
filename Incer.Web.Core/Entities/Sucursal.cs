namespace Incer.Web.Core.Entities
{
    public class Sucursal : BaseEntity
    {
        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        public string Nombre { get; set; } = string.Empty;
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public int LocalidadId { get; set; }
        public Localidad? Localidad { get; set; }
        public byte[]? MapaDePuestos { get; set; }
        public string? Mail { get; set; }
    }
} 