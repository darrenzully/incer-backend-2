namespace Incer.Web.Core.Entities
{
    public class PresupuestoRemito : BaseEntity
    {
        public int RemitoId { get; set; }
        public int PresupuestoId { get; set; }
        public string Descripcion => Presupuesto != null ? $"Presupuesto N {Presupuesto.Numero}" : "";

        public Remito? Remito { get; set; }
        public Presupuesto? Presupuesto { get; set; }
    }
}
