namespace Incer.Web.Core.Entities
{
    public class PresupuestoArchivo : BaseEntity
    {
        public int ArchivoId { get; set; }
        public int PresupuestoId { get; set; }

        public Archivo? Archivo { get; set; }
        public Presupuesto? Presupuesto { get; set; }
    }
}
