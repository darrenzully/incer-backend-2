namespace Incer.Web.Core.Entities
{
    public class ClienteAlcance : BaseEntity
    {
        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        public int TipoDeProductoId { get; set; }
        public TipoDeProducto? TipoDeProducto { get; set; }

        public int? TipoDeElementoId { get; set; }
        public TipoDeElemento? TipoDeElemento { get; set; }

        public int? TipoDeServicioId { get; set; }
        public TipoDeServicio? TipoDeServicio { get; set; }

        public int PeriodicidadId { get; set; }
        public Periodicidad? Periodicidad { get; set; }
    }
} 