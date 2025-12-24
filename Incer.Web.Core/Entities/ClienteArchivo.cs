namespace Incer.Web.Core.Entities
{
    public class ClienteArchivo : BaseEntity
    {
        public int ClienteId { get; set; }
        public int ArchivoId { get; set; }

        public Archivo? Archivo { get; set; }
        public Cliente? Cliente { get; set; }
    }
} 