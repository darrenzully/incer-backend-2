using System.Collections.Generic;
using System.Threading.Tasks;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public Repository(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public virtual async Task AddAsync(T entity)
        {
            entity.FechaCreacion = DateTime.UtcNow;
            var user = _httpContextAccessor?.HttpContext?.User?.Identity?.Name;
            entity.UsuarioCreacion = !string.IsNullOrEmpty(user) ? user : "system";
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task DeleteAsync(T entity)
        {
            entity.Activo = false;
            entity.FechaUpdate = DateTime.UtcNow;
            var user = _httpContextAccessor?.HttpContext?.User?.Identity?.Name;
            entity.UsuarioUpdate = !string.IsNullOrEmpty(user) ? user : "system";
            _context.Set<T>().Update(entity);
            await _context.SaveChangesAsync();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _context.Set<T>().Where(e => e.Activo).ToListAsync();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _context.Set<T>().FirstOrDefaultAsync(e => e.Id == id && e.Activo);
        }

        public virtual async Task UpdateAsync(T entity)
        {
            entity.FechaUpdate = DateTime.UtcNow;
            var user = _httpContextAccessor?.HttpContext?.User?.Identity?.Name;
            entity.UsuarioUpdate = !string.IsNullOrEmpty(user) ? user : "system";
            _context.Set<T>().Update(entity);
            await _context.SaveChangesAsync();
        }

        public virtual IQueryable<T> GetQueryable()
        {
            return _context.Set<T>().Where(e => e.Activo);
        }
    }
} 