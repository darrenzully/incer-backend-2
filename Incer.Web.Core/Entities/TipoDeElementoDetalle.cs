using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class TipoDeElementoDetalle : BaseEntity
    {
        [Required]
        public int TipoElementoId { get; set; }
        public TipoDeElemento? TipoElemento { get; set; }

        [Required]
        public string Item { get; set; } = string.Empty;

        [Required]
        public int TipoDatoId { get; set; }
        public TipoDeDato? TipoDeDato { get; set; }

        public bool Requerido { get; set; }
    }
}
