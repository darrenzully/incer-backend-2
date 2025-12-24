using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class TipoRemito : BaseEntity
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;
    }
}
