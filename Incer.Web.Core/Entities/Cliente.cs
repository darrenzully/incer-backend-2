using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Core.Entities
{
    public class Cliente : BaseEntity
    {
        public int Numero { get => this.Id; }

        [Required(ErrorMessage = "El tipo de cliente es obligatorio")]
        [Display(Name = "Tipo de cliente")]
        public int TipoDeClienteId { get; set; }
        public TipoDeCliente? TipoDeCliente { get; set; }

        [Required(ErrorMessage = "El tipo de servicio es obligatorio")]
        [Display(Name = "Tipo de servicio")]
        public int TipoDeServicioId { get; set; }
        public TipoDeServicio? TipoDeServicio { get; set; }

        [Required]
        [Display(Name = "Centro de Negocio")]
        public int BusinessCenterId { get; set; }
        public BusinessCenter? BusinessCenter { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "Debe ingresar un CUIT")]
        public string CUIT { get; set; } = string.Empty;

        [Display(Name = "Teléfono")]
        public string? Telefono { get; set; }

        [Display(Name = "Razón social")]
        public string? RazonSocial { get; set; }

        [Display(Name = "Vendedor")]
        [Required(ErrorMessage = "Debe seleccionar un vendedor")]
        public int VendedorId { get; set; }
        public User? Vendedor { get; set; }

        public int? ArchivoId { get; set; }
        public List<Archivo>? Archivos { get; set; }
        public List<ClienteAlcance>? Alcances { get; set; }
        public List<ClienteAlcanceDetalle>? AlcancesDetalles { get; set; }
        public List<int>? AlcancesDetallesIds { get; set; }
        public List<ClienteArchivo>? ClienteArchivos { get; set; }
    }
} 