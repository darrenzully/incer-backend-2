using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface ICheckListRepository : IRepository<CheckList>
    {
        Task<IEnumerable<CheckList>> GetCheckListsWithDetailsAsync();
        Task<CheckList?> GetCheckListWithDetailsAsync(int id);
        Task<IEnumerable<CheckList>> GetCheckListsByTipoProductoAsync(int tipoProductoId);
        Task<IEnumerable<CheckList>> GetCheckListsBySucursalAsync(int sucursalId);
        Task<IEnumerable<CheckList>> GetCheckListsPorDefectoAsync();
        Task<bool> ExistsActiveCheckListAsync(int tipoProductoId, int? tipoElementoId, int? clienteId, int? sucursalId, int? excludeId = null);
    }
}
