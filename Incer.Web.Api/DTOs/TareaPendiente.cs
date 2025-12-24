namespace Incer.Web.Api.DTOs
{
    public class TareaPendiente
    {
        public int TareaId { get; set; }
        public int? RelevamientoId { get; set; }
        public string Cliente { get; set; } = string.Empty;
        public int SucursalId { get; set; }
        public string Sucursal { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public int TipoDeTareaId { get; set; }
        public string TipoDeTarea { get; set; } = string.Empty;
    }
}
