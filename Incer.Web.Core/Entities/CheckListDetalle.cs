namespace Incer.Web.Core.Entities
{
    public class CheckListDetalle : BaseEntity
    {

        public required int Orden { get; set; }
        public string? Titulo { get; set; }
        public string? Item { get; set; }
        public bool Requerido { get; set; }

        public required int CheckListId { get; set; }
        public CheckList? CheckList { get; set; }

        public required int TipoDeDatoId { get; set; }
        public TipoDeDato? TipoDeDato { get; set; }

        // Navigation properties for related entities
        public ICollection<RelevamientoDetalleResultado>? RelevamientoDetalleResultados { get; set; }
    }
}
