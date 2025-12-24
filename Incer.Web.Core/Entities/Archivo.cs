using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Archivo : BaseEntity
    {
        public string? Nombre { get; set; }
        public DateTime Fecha { get; set; }
        public DateTime? FechaRecepcion { get; set; }
        public byte[]? Contenido { get; set; }
    }
}