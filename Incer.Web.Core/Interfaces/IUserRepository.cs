using System.Collections.Generic;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;

namespace Incer.Web.Core.Interfaces {
  public interface IUserRepository : IRepository<User> {
    Task<User?> GetByAliasAsync(string alias);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetByRoleIdAsync(int roleId);
    Task<IEnumerable<User>> GetByBusinessCenterIdAsync(int businessCenterId);
    Task<User?> GetByIdWithRoleAsync(int id);
    Task<IEnumerable<User>> GetAllWithRoleAsync();
    Task<User?> GetByAliasWithRoleAsync(string alias);
    Task<User?> GetByEmailWithRoleAsync(string email);
    Task<IEnumerable<User>> GetByRoleIdWithRoleAsync(int roleId);
  }
} 