using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface IExtintorRepository : IRepository<Extintor>
    {
        Task<IEnumerable<Extintor>> GetBySucursalIdAsync(int sucursalId);
        Task<IEnumerable<Extintor>> GetByClienteIdAsync(int clienteId);
    }

    public interface IExtintorHistoriaRepository : IRepository<ExtintorHistoria>
    {
        Task<IEnumerable<ExtintorHistoria>> GetByExtintorIdAsync(int extintorId);
        Task<IEnumerable<ExtintorHistoria>> GetBySucursalIdAsync(int sucursalId);
        Task<IEnumerable<ExtintorHistoria>> GetByPuestoIdAsync(int puestoId);
    }

    public interface IElementoRepository : IRepository<Elemento>
    {
        Task<IEnumerable<Elemento>> GetBySucursalIdAsync(int sucursalId);
        Task<IEnumerable<Elemento>> GetByTipoElementoIdAsync(int tipoElementoId);
    }

    public interface IPuestoRepository : IRepository<Puesto>
    {
        Task<IEnumerable<Puesto>> GetBySucursalIdAsync(int sucursalId);
        Task<IEnumerable<Puesto>> GetByExtintorIdAsync(int extintorId);
    }

    public interface ITipoDeCargaRepository : IRepository<TipoDeCarga>
    {
    }

    public interface ICapacidadRepository : IRepository<Capacidad>
    {
    }

    public interface IFabricanteRepository : IRepository<Fabricante>
    {
    }

    public interface IElementoTipoElementoDetalleRepository : IRepository<ElementoTipoElementoDetalle>
    {
        Task<IEnumerable<ElementoTipoElementoDetalle>> GetByElementoIdAsync(int elementoId);
    }
}
