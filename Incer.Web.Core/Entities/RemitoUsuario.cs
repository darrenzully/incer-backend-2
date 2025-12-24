using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class RemitoUsuario : BaseEntity
    {
        [StringLength(1)]
        public string? Letra { get; set; }

        public string? Secuencia { get; set; }
        public int NumeroDesde { get; set; }
        public int NumeroHasta { get; set; }

        [Required]
        public int ChoferId { get; set; }
        public User? Chofer { get; set; }
    }
}
