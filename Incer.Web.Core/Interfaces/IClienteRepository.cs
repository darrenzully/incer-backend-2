using System.Collections.Generic;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IClienteRepository : IRepository<Cliente>
    {
        Task<IEnumerable<Cliente>> GetClientesWithDetailsAsync();
        Task<Cliente?> GetClienteWithDetailsAsync(int id);
        Task<IEnumerable<Cliente>> GetClientesByVendedorAsync(int vendedorId);
        Task<IEnumerable<Cliente>> GetClientesByCentroAsync(int centroId);
        Task<IEnumerable<Cliente>> GetAllForAdminAsync();
        Task<Cliente?> GetByIdForAdminAsync(int id);
    }
} 