using System.Collections.Generic;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces {
  public interface IRoleRepository : IRepository<Role> {
    Task<Role?> GetByNameAsync(string name);
    Task<IEnumerable<Role>> GetByPriorityAsync(int minPriority);
    Task<IEnumerable<Role>> GetSystemRolesAsync();
    Task<Role?> GetByIdWithPermissionsAsync(int id);
    Task<IEnumerable<Role>> GetAllWithPermissionsAsync();
  }
} 