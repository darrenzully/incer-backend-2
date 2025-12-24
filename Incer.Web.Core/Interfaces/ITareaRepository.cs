using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface ITareaRepository : IRepository<Tarea>
    {
        Task<IEnumerable<Tarea>> GetTareasPendientesAsync();
        Task<IEnumerable<Tarea>> GetSolicitudesAsync();
        Task<IEnumerable<Tarea>> GetTareasByUsuarioAsync(int usuarioId);
        Task<IEnumerable<Tarea>> GetTareasBySucursalAsync(int sucursalId);
    }
}
