using System.ComponentModel;

namespace Incer.Web.Core.Enums
{
    public enum TipoDeContacto
    {
        Email = 1,
        [Description("Llamada Telefonica")]
        LlamadaTelefonica = 2,
        [Description("Encuentro Personal")]
        EncuentroPersonal = 3,
        [Description("Visita Tecnica")]
        VisitaTecnica = 4,
        [Description("Finalizacion de la Visita Tecnica")]
        FinalizacionVisitaTecnica = 5,
    }
}
