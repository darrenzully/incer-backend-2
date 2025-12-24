namespace Incer.Web.Api.DTOs
{
    public class ComboListSucursales
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public int ClienteId { get; set; }
    }
}
