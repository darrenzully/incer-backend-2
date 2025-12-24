namespace Incer.Web.Core.Entities
{
    public class TipoDeCliente : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }
} 