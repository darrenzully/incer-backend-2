namespace Incer.Web.Core.Entities
{
    public class ClienteAlcanceDetalle : BaseEntity
    {
        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        public int AlcanceDetalleId { get; set; }
        public AlcanceDetalle? AlcanceDetalle { get; set; }
    }
} 