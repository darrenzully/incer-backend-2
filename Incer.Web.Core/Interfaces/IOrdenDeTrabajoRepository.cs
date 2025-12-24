using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IOrdenDeTrabajoRepository : IRepository<OrdenDeTrabajo>
    {
        Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesBySucursalAsync(int sucursalId);
        Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesByUsuarioAsync(int usuarioId);
        Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesByEstadoAsync(int estadoId);
        Task<IEnumerable<OrdenDeTrabajo>> GetOrdenesByFechaAsync(DateTime fechaDesde, DateTime fechaHasta);
        Task<int> GetNextNumeroAsync();
    }
}
