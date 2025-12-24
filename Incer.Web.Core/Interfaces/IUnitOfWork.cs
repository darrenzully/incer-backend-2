using System;
using System.Threading.Tasks;

namespace Incer.Web.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync();
    }
} 