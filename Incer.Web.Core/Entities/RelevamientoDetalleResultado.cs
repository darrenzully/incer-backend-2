using System.ComponentModel.DataAnnotations;
using Incer.Web.Core.Enums;

namespace Incer.Web.Core.Entities
{
    public class RelevamientoDetalleResultado : BaseEntity
    {
        public bool Conformidad { get; set; }

        public string? Valor { get; set; }

        public string? Observaciones { get; set; }

        public Urgencia? Urgencia { get; set; }

        [Required]
        public int RelevamientoDetalleId { get; set; }
        public RelevamientoDetalle? RelevamientoDetalle { get; set; }

        [Required]
        public int CheckListDetalleId { get; set; }
        public CheckListDetalle? CheckListDetalle { get; set; }

        public int? ArchivoId { get; set; }
        public Archivo? Archivo { get; set; }
    }
}