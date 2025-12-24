namespace Incer.Web.Core.Entities
{
    public class Localidad : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public int ProvinciaId { get; set; }
        public Provincia? Provincia { get; set; }
    }
} 