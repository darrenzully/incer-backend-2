using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Presupuesto : BaseEntity
    {
        [Required]
        public string Numero { get; set; } = string.Empty;
        
        [Required]
        public string Descripcion { get; set; } = string.Empty;
        
        public DateTime Fecha { get; set; }
        public int UsuarioId { get; set; }
        
        [Required]
        public int SucursalId { get; set; }
        
        public EstadoPresupuesto Estado { get; set; }
        public string? EstadoStr { get; set; }
        public int? ArchivoId { get; set; }

        // Navigation properties
        public User? Usuario { get; set; }
        public Sucursal? Sucursal { get; set; }
        public ICollection<Archivo>? Archivos { get; set; }
        public ICollection<PresupuestoRemito>? PresupuestosRemitos { get; set; }
        public ICollection<PresupuestoArchivo>? PresupuestosArchivos { get; set; }
    }
}
