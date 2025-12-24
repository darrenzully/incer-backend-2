using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IRelevamientoRepository : IRepository<Relevamiento>
    {
        Task<IEnumerable<Relevamiento>> GetRelevamientosByTareaAsync(int tareaId);
        Task<IEnumerable<Relevamiento>> GetRelevamientosByUsuarioAsync(int usuarioId);
        Task<IEnumerable<Relevamiento>> GetRelevamientosBySucursalAsync(int sucursalId);
    }
}
