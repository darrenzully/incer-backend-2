using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IRemitoRepository : IRepository<Remito>
    {
        Task<IEnumerable<Remito>> GetRemitosWithDetailsAsync();
        Task<Remito?> GetRemitoWithDetailsAsync(int id);
        Task<string> GenerateNextRemitoNumberAsync(int choferId, string? letra = null, string? secuencia = null);
        Task<IEnumerable<Remito>> GetRemitosBySucursalIdAsync(int sucursalId);
        Task<IEnumerable<Remito>> GetRemitosByEstadoAsync(EstadoRemito estado);
        Task<IEnumerable<Remito>> GetRemitosByChoferIdAsync(int choferId);
        Task<IEnumerable<Remito>> GetRemitosByFechaAsync(DateTime fechaDesde, DateTime fechaHasta);
    }
}
