using System.Threading.Tasks;
using Incer.Web.Core.Interfaces;

namespace Incer.Web.Infrastructure.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        public void Dispose()
        {
            // Liberar recursos
        }

        public Task<int> SaveChangesAsync()
        {
            // Implementación simulada
            return Task.FromResult(0);
        }
    }
} 