using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IArchivoRepository : IRepository<Archivo>
    {
        Task<Archivo?> GetByNombreAsync(string nombre);
        Task<IEnumerable<Archivo>> GetByFechaAsync(DateTime fecha);
    }
}
