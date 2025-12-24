using System.ComponentModel;

namespace Incer.Web.Core.Entities
{
    public enum EstadoPresupuesto
    {
        [Description("En Proceso")]
        EnProceso = 1,
        Aprobado = 2,
        Reprobado = 3
    }
}
