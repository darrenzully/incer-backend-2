namespace Incer.Web.Core.Entities
{
    public class ElementoTipoElementoDetalle : BaseEntity
    {
        public int ElementoId { get; set; }
        public Elemento? Elemento { get; set; }
        public int TipoElementoDetalleId { get; set; }
        public TipoDeElementoDetalle? TipoElementoDetalle { get; set; }
        public string Valor { get; set; } = string.Empty;
    }
}
