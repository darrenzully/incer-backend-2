using System.ComponentModel.DataAnnotations;
using Incer.Web.Core.Enums;

namespace Incer.Web.Core.Entities
{
    public class Contacto : BaseEntity
    {
        public TipoDeContacto TipoDeContacto { get; set; }
        public DateTime Fecha { get; set; }
        public string? Detalles { get; set; }
        public EstadoVisita? EstadoVisitaTecnica { get; set; }
        public int SucursalId { get; set; }
        public Sucursal? Sucursal { get; set; }
        public int UsuarioId { get; set; }
        public User? Usuario { get; set; }
        public ICollection<Tarea>? Tareas { get; set; }
    }
}
