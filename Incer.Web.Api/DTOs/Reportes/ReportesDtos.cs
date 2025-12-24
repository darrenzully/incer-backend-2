namespace Incer.Web.Api.DTOs.Reportes
{
    public class ReporteNoConformeItemDto
    {
        public int CheckListDetalleId { get; set; }
        public int Orden { get; set; }
        public string Item { get; set; } = string.Empty;
        public int Cantidad { get; set; }
    }

    public class ReporteRemitoDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public string ChoferNombre { get; set; } = string.Empty;
        public string ClienteNombre { get; set; } = string.Empty;
        public string? Observaciones { get; set; }

        // Opcional: para mostrar miniatura en front (data:image/jpeg;base64,...)
        public string? FirmaOperadorBase64 { get; set; }
        public string? FirmaEncargadoBase64 { get; set; }
    }

    public class ReporteDetalleRowDto
    {
        public DateTime Fecha { get; set; }
        public Dictionary<string, string?> ResultadosPorItem { get; set; } = new();
    }

    public class ReportePuestosRelevadosRowDto : ReporteDetalleRowDto
    {
        public string? Puesto { get; set; }
        public string? DatosDelMatafuego { get; set; }
    }

    public class ReporteElementosRelevadosRowDto : ReporteDetalleRowDto
    {
        public string? DatosDelElemento { get; set; }
        public int? Interno { get; set; }
        public string? Ubicacion { get; set; }
    }

    public class ReportePuestosRelevadosDto
    {
        public DateTime FechaDesde { get; set; }
        public DateTime FechaHasta { get; set; }
        public int SucursalId { get; set; }
        public List<ReporteNoConformeItemDto> NoConforme { get; set; } = new();
        public List<ReporteRemitoDto> Remitos { get; set; } = new();
        public List<ReportePuestosRelevadosRowDto> Detalles { get; set; } = new();
    }

    public class ReporteElementosRelevadosDto
    {
        public DateTime FechaDesde { get; set; }
        public DateTime FechaHasta { get; set; }
        public int SucursalId { get; set; }
        public int TipoDeElementoId { get; set; }
        public List<ReporteNoConformeItemDto> NoConforme { get; set; } = new();
        public List<ReporteRemitoDto> Remitos { get; set; } = new();
        public List<ReporteElementosRelevadosRowDto> Detalles { get; set; } = new();
    }
}


