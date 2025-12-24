using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface ILocalidadRepository : IRepository<Localidad>
    {
        Task<IEnumerable<Localidad>> GetByProvinciaIdAsync(int provinciaId);
    }
} 