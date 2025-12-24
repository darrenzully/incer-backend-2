using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IPresupuestoRepository : IRepository<Presupuesto>
    {
        Task<IEnumerable<Presupuesto>> GetPresupuestosWithDetailsAsync();
        Task<Presupuesto?> GetPresupuestoWithDetailsAsync(int id);
        Task<IEnumerable<Presupuesto>> GetPresupuestosBySucursalAsync(int sucursalId);
        Task<IEnumerable<Presupuesto>> GetPresupuestosByEstadoAsync(EstadoPresupuesto estado);
        Task<string> GenerateNextNumeroAsync();
    }
}
