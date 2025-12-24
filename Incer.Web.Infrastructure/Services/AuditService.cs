using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Incer.Web.Core.Entities;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Infrastructure.Services
{
    public interface IAuditService
    {
        Task LogActionAsync(string action, string entityType, int? entityId, object? oldValues = null, object? newValues = null, bool success = true, string? errorMessage = null);
        Task<IEnumerable<AuditLog>> GetUserAuditLogsAsync(int userId, DateTime? fromDate = null, DateTime? toDate = null);
        Task<IEnumerable<AuditLog>> GetEntityAuditLogsAsync(string entityType, int entityId);
        Task<IEnumerable<AuditLog>> GetSystemAuditLogsAsync(DateTime? fromDate = null, DateTime? toDate = null);
    }

    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogActionAsync(string action, string entityType, int? entityId, object? oldValues = null, object? newValues = null, bool success = true, string? errorMessage = null)
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                var user = httpContext?.User;
                
                // Extraer información del usuario del contexto JWT
                var userIdClaim = user?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var userEmailClaim = user?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                
                if (!int.TryParse(userIdClaim, out var userId))
                {
                    userId = 0; // Usuario anónimo o no autenticado
                }

                var auditLog = new AuditLog
                {
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    UserId = userId,
                    UserEmail = userEmailClaim ?? "anonymous@system.com",
                    Details = GenerateDetails(action, entityType, entityId, oldValues, newValues),
                    IpAddress = GetClientIpAddress(httpContext),
                    UserAgent = GetUserAgent(httpContext),
                    Timestamp = DateTime.UtcNow,
                    OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                    NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                    Success = success,
                    ErrorMessage = errorMessage,
                    Activo = true,
                    UsuarioCreacion = userEmailClaim ?? "system",
                    UsuarioUpdate = userEmailClaim ?? "system",
                    FechaCreacion = DateTime.UtcNow,
                    FechaUpdate = DateTime.UtcNow
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log del error de auditoría sin fallar la operación principal
                // En producción, considera usar un sistema de logging más robusto
                Console.WriteLine($"Error logging audit: {ex.Message}");
            }
        }

        public async Task<IEnumerable<AuditLog>> GetUserAuditLogsAsync(int userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.UserId == userId && al.Activo);

            if (fromDate.HasValue)
            {
                query = query.Where(al => al.Timestamp >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(al => al.Timestamp <= toDate.Value);
            }

            return await query
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetEntityAuditLogsAsync(string entityType, int entityId)
        {
            return await _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.EntityType == entityType && al.EntityId == entityId && al.Activo)
                .OrderByDescending(al => al.Timestamp)
                .ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetSystemAuditLogsAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.AuditLogs
                .Include(al => al.User)
                .Where(al => al.Activo);

            if (fromDate.HasValue)
            {
                query = query.Where(al => al.Timestamp >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(al => al.Timestamp <= toDate.Value);
            }

            return await query
                .OrderByDescending(al => al.Timestamp)
                .Take(1000) // Limitar a los últimos 1000 logs
                .ToListAsync();
        }

        private string GenerateDetails(string action, string entityType, int? entityId, object? oldValues, object? newValues)
        {
            var details = new
            {
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Timestamp = DateTime.UtcNow,
                OldValues = oldValues,
                NewValues = newValues
            };

            return JsonSerializer.Serialize(details);
        }

        private string GetClientIpAddress(HttpContext? httpContext)
        {
            if (httpContext == null) return "unknown";

            // Intentar obtener la IP real del cliente
            var forwardedHeader = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedHeader))
            {
                return forwardedHeader.Split(',')[0].Trim();
            }

            var remoteIp = httpContext.Connection.RemoteIpAddress?.ToString();
            return remoteIp ?? "unknown";
        }

        private string GetUserAgent(HttpContext? httpContext)
        {
            if (httpContext == null) return "unknown";
            
            return httpContext.Request.Headers["User-Agent"].FirstOrDefault() ?? "unknown";
        }
    }
}
