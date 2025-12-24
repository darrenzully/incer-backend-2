using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface ISucursalRepository : IRepository<Sucursal>
    {
        Task<IEnumerable<Sucursal>> GetByClienteIdAsync(int clienteId);
        Task<IEnumerable<Sucursal>> GetActivasAsync();
        Task<IEnumerable<Sucursal>> GetAllForAdminAsync();
        Task<Sucursal?> GetByIdForAdminAsync(int id);
    }
} 