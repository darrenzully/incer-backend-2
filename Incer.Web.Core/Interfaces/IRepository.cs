using System.Collections.Generic;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using System.Linq;

namespace Incer.Web.Core.Interfaces
{
    public interface IRepository<T> where T : BaseEntity
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        IQueryable<T> GetQueryable();
    }
} 