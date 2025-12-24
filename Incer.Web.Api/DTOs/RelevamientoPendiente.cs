namespace Incer.Web.Api.DTOs
{
    public class RelevamientoPendiente
    {
        public int Id { get; set; }
        public int SucursalId { get; set; }
        public int? TipoDeElementoId { get; set; }
        public int TipoDeProductoId { get; set; }
        public int UsuarioId { get; set; }
        public int TareaId { get; set; }
        public int? RemitoId { get; set; }
        public int CheckListId { get; set; }
        public int EstadoTareaId { get; set; }
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
        public DateTime Fecha { get; set; }
        public DateTime? FechaFin { get; set; }
        public DateTime? FechaRecepcion { get; set; }
        public string? Leyenda { get; set; }
        public DateTime? FechaUltimoRelevamiento { get; set; }

        public RelevamientoPendiente()
        {
        }

        public RelevamientoPendiente(Core.Entities.Relevamiento relevamiento)
        {
            Id = relevamiento.Id;
            SucursalId = relevamiento.SucursalId;
            TipoDeElementoId = relevamiento.TipoDeElementoId;
            TipoDeProductoId = relevamiento.TipoDeProductoId;
            UsuarioId = relevamiento.UsuarioId;
            TareaId = relevamiento.TareaId;
            RemitoId = relevamiento.RemitoId;
            CheckListId = relevamiento.CheckListId;
            EstadoTareaId = relevamiento.EstadoTareaId;
            Descripcion = relevamiento.Descripcion;
            Activo = relevamiento.Activo;
            Fecha = relevamiento.Fecha;
            FechaFin = relevamiento.FechaFin;
            FechaRecepcion = relevamiento.FechaRecepcion;
            Leyenda = relevamiento.Leyenda;
        }
    }
}

