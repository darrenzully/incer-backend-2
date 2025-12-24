using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IRemitoUsuarioRepository : IRepository<RemitoUsuario>
    {
        Task<IEnumerable<RemitoUsuario>> GetRemitoUsuariosWithDetailsAsync();
        Task<RemitoUsuario?> GetRemitoUsuarioWithDetailsAsync(int id);
        Task<IEnumerable<RemitoUsuario>> GetRemitoUsuariosByChoferIdAsync(int choferId);
        Task<bool> ExisteRangoNumerosAsync(int choferId, int numeroDesde, int numeroHasta, int? excludeId = null);
    }
}
