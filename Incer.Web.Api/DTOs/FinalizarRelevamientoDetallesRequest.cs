using System.Text.Json.Serialization;
using Incer.Web.Core.Enums;

namespace Incer.Web.Api.DTOs
{
    // DTO de compatibilidad para soportar payload legacy (api vieja) y variantes del frontend
    public class FinalizarRelevamientoDetallesRequest
    {
        [JsonPropertyName("fecha")]
        public DateTime? Fecha { get; set; }

        [JsonPropertyName("fechaFin")]
        public DateTime? FechaFin { get; set; }

        [JsonPropertyName("remitoId")]
        public int? RemitoId { get; set; }

        // Legacy api: "detalles"
        [JsonPropertyName("detalles")]
        public List<RelevamientoDetalleRequest>? Detalles { get; set; }

        // Webv2: "relevamientoDetalles"
        [JsonPropertyName("relevamientoDetalles")]
        public List<RelevamientoDetalleRequest>? RelevamientoDetalles { get; set; }
    }

    public class RelevamientoDetalleRequest
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("latitud")]
        public float? Latitud { get; set; }

        [JsonPropertyName("longitud")]
        public float? Longitud { get; set; }

        [JsonPropertyName("observaciones")]
        public string? Observaciones { get; set; }

        [JsonPropertyName("productoId")]
        public int ProductoId { get; set; }

        [JsonPropertyName("puestoId")]
        public int? PuestoId { get; set; }

        // Legacy: creación inline
        [JsonPropertyName("puesto")]
        public PuestoRequest? Puesto { get; set; }

        [JsonPropertyName("archivoId")]
        public int? ArchivoId { get; set; }

        [JsonPropertyName("archivo")]
        public ArchivoRequest? Archivo { get; set; }

        [JsonPropertyName("extintor")]
        public ExtintorRequest? Extintor { get; set; }

        [JsonPropertyName("elemento")]
        public ElementoRequest? Elemento { get; set; }

        // Api vieja: "detalleResultados"
        [JsonPropertyName("detalleResultados")]
        public List<RelevamientoDetalleResultadoRequest>? DetalleResultados { get; set; }

        // Front: alias "relevamientoDetalleResultados"
        [JsonPropertyName("relevamientoDetalleResultados")]
        public List<RelevamientoDetalleResultadoRequest>? RelevamientoDetalleResultados { get; set; }

        [JsonPropertyName("detalleFotos")]
        public List<RelevamientoDetalleFotoRequest>? DetalleFotos { get; set; }
    }

    public class RelevamientoDetalleResultadoRequest
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("conformidad")]
        public bool? Conformidad { get; set; }

        [JsonPropertyName("valor")]
        public string? Valor { get; set; }

        [JsonPropertyName("observaciones")]
        public string? Observaciones { get; set; }

        [JsonPropertyName("urgencia")]
        public Urgencia? Urgencia { get; set; }

        [JsonPropertyName("checkListDetalleId")]
        public int? CheckListDetalleId { get; set; }

        [JsonPropertyName("archivoId")]
        public int? ArchivoId { get; set; }
    }

    public class RelevamientoDetalleFotoRequest
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("archivoId")]
        public int? ArchivoId { get; set; }
    }

    public class ArchivoRequest
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("nombre")]
        public string? Nombre { get; set; }

        [JsonPropertyName("fecha")]
        public DateTime? Fecha { get; set; }

        // System.Text.Json soporta byte[] como base64
        [JsonPropertyName("contenido")]
        public byte[]? Contenido { get; set; }
    }

    public class PuestoRequest
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("nombre")]
        public string? Nombre { get; set; }

        [JsonPropertyName("ubicacion")]
        public string? Ubicacion { get; set; }

        [JsonPropertyName("codigo")]
        public string? Codigo { get; set; }
    }

    public class ExtintorRequest
    {
        // Campos mínimos usados por la lógica actual (el resto se mapeará si viene)
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("nroSerie")]
        public string? NroSerie { get; set; }

        [JsonPropertyName("tipoDeCargaId")]
        public int? TipoDeCargaId { get; set; }

        [JsonPropertyName("capacidadId")]
        public int? CapacidadId { get; set; }

        [JsonPropertyName("vencimientoCarga")]
        public DateTime? VencimientoCarga { get; set; }

        [JsonPropertyName("vencimientoPH")]
        public DateTime? VencimientoPH { get; set; }

        [JsonPropertyName("orden")]
        public int? Orden { get; set; }

        [JsonPropertyName("incorporacion")]
        public DateTime? Incorporacion { get; set; }

        [JsonPropertyName("reserva")]
        public bool? Reserva { get; set; }

        [JsonPropertyName("baja")]
        public bool? Baja { get; set; }

        [JsonPropertyName("ubicacion")]
        public string? Ubicacion { get; set; }

        [JsonPropertyName("codigo")]
        public string? Codigo { get; set; }
    }

    public class ElementoRequest
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("tipoDeElementoId")]
        public int? TipoDeElementoId { get; set; }

        [JsonPropertyName("sucursalId")]
        public int? SucursalId { get; set; }

        [JsonPropertyName("ubicacion")]
        public string? Ubicacion { get; set; }

        [JsonPropertyName("codigo")]
        public string? Codigo { get; set; }

        [JsonPropertyName("interno")]
        public int? Interno { get; set; }

        [JsonPropertyName("detalles")]
        public List<ElementoTipoElementoDetalleRequest>? Detalles { get; set; }
    }

    public class ElementoTipoElementoDetalleRequest
    {
        [JsonPropertyName("tipoElementoDetalleId")]
        public int TipoElementoDetalleId { get; set; }

        [JsonPropertyName("valor")]
        public string? Valor { get; set; }
    }
}


