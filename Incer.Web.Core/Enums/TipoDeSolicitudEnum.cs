using System.ComponentModel;

namespace Incer.Web.Core.Enums
{
    public enum TipoDeSolicitudEnum
    {
        [Description("Correctivo")]
        Correctivo = 1,
        [Description("Emergencia")]
        Emergencia = 2,
        [Description("Visita Tecnica")]
        VisitaTecnica = 3
    }
}
