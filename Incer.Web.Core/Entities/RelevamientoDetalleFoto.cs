namespace Incer.Web.Core.Entities
{
    public class RelevamientoDetalleFoto : BaseEntity
    {
        public int ArchivoId { get; set; }
        public Archivo? Archivo { get; set; }

        public int RelevamientoDetalleId { get; set; }
        public RelevamientoDetalle? RelevamientoDetalle { get; set; }
    }
}


