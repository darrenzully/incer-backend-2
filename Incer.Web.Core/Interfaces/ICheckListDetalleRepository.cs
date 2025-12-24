using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces
{
    public interface ICheckListDetalleRepository : IRepository<CheckListDetalle>
    {
        Task<IEnumerable<CheckListDetalle>> GetDetallesByCheckListIdAsync(int checkListId);
        Task<IEnumerable<CheckListDetalle>> GetDetallesWithTipoDatoAsync(int checkListId);
    }
}
