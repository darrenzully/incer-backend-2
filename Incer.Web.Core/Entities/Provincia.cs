namespace Incer.Web.Core.Entities
{
    public class Provincia : BaseEntity
    {
        public string Nombre { get; set; } = string.Empty;
        public string Codigo { get; set; } = string.Empty;
        public int PaisId { get; set; }
        public Pais? Pais { get; set; }
    }
} 