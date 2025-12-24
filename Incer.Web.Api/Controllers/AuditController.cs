using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;
using Incer.Web.Infrastructure.Services;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        // GET: api/audit/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetUserAuditLogs(
            int userId, 
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            var logs = await _auditService.GetUserAuditLogsAsync(userId, fromDate, toDate);
            return Ok(logs);
        }

        // GET: api/audit/entity/UserAppAccess/5
        [HttpGet("entity/{entityType}/{entityId}")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetEntityAuditLogs(string entityType, int entityId)
        {
            var logs = await _auditService.GetEntityAuditLogsAsync(entityType, entityId);
            return Ok(logs);
        }

        // GET: api/audit/system
        [HttpGet("system")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetSystemAuditLogs(
            [FromQuery] DateTime? fromDate = null, 
            [FromQuery] DateTime? toDate = null)
        {
            var logs = await _auditService.GetSystemAuditLogsAsync(fromDate, toDate);
            return Ok(logs);
        }
    }
}
