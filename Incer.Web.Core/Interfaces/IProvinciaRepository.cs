using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IProvinciaRepository : IRepository<Provincia>
    {
        Task<IEnumerable<Provincia>> GetByPaisIdAsync(int paisId);
    }
} 