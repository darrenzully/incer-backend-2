using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface ITipoElementoRepository : IRepository<TipoDeElemento>
    {
        Task<TipoDeElemento?> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<TipoDeElemento>> GetAllWithDetailsAsync();
        Task<IEnumerable<TipoDeElemento>> GetByNombreAsync(string nombre);
    }

    public interface ITipoElementoDetalleRepository : IRepository<TipoDeElementoDetalle>
    {
        Task<IEnumerable<TipoDeElementoDetalle>> GetByTipoElementoIdAsync(int tipoElementoId);
    }

    public interface ITipoDatoRepository : IRepository<TipoDeDato>
    {
        Task<TipoDeDato?> GetByNombreAsync(string nombre);
    }
}
