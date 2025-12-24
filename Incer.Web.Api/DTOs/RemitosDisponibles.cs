namespace Incer.Web.Api.DTOs
{
    /// <summary>
    /// Número de remitos asignados y disponibles para un usuario
    /// agrupados por letra y secuencia
    /// </summary>
    public class RemitosDisponibles
    {
        public string Letra { get; set; } = string.Empty;
        public string Secuencia { get; set; } = string.Empty;
        public List<int> Numeros { get; set; } = new List<int>();
    }
}
