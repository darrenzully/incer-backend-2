namespace Incer.Web.Core.Entities
{
    public class TipoDeCarga : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public int RecargaPh { get; set; }
        public int UnidadDeMedidaId { get; set; }
        public UnidadDeMedida? UnidadDeMedida { get; set; }
        public int Duracion { get; set; }
    }
}
