using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;
        private readonly IPermissionRepository _permissionRepository;

        public PermissionsController(IPermissionService permissionService, IPermissionRepository permissionRepository)
        {
            _permissionService = permissionService;
            _permissionRepository = permissionRepository;
        }

        // GET: api/permissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissions()
        {
            try
            {
                // Obtener todos los permisos disponibles
                var permissions = await _permissionRepository.GetAllAsync();
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // POST: api/permissions/check
        [HttpPost("check")]
        public async Task<ActionResult<PermissionCheckResult>> CheckPermission([FromBody] PermissionCheckRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var hasPermission = await _permissionService.CheckPermissionAsync(
                request.UserId, 
                request.Resource, 
                request.Action, 
                request.CenterId, 
                request.AppId
            );

            return new PermissionCheckResult
            {
                HasPermission = hasPermission,
                UserId = request.UserId,
                Resource = request.Resource,
                Action = request.Action,
                CenterId = request.CenterId,
                AppId = request.AppId
            };
        }

        // GET: api/permissions/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetUserPermissions(int userId, [FromQuery] int? appId = null)
        {
            var permissions = await _permissionService.GetUserPermissionsAsync(userId, appId);
            return Ok(permissions);
        }

        // GET: api/permissions/user/5/centers
        [HttpGet("user/{userId}/centers")]
        public async Task<ActionResult<IEnumerable<int>>> GetUserAccessibleCenters(int userId, [FromQuery] int? appId = null)
        {
            var centers = await _permissionService.GetUserAccessibleCentersAsync(userId, appId);
            return Ok(centers);
        }

        // GET: api/permissions/user/5/apps
        [HttpGet("user/{userId}/apps")]
        public async Task<ActionResult<IEnumerable<int>>> GetUserAccessibleApps(int userId)
        {
            var apps = await _permissionService.GetUserAccessibleAppsAsync(userId);
            return Ok(apps);
        }

        // GET: api/permissions/user/5/app/3/access
        [HttpGet("user/{userId}/app/{appId}/access")]
        public async Task<ActionResult<bool>> CanAccessApp(int userId, int appId)
        {
            var canAccess = await _permissionService.CanAccessAppAsync(userId, appId);
            return Ok(canAccess);
        }

        // GET: api/permissions/user/5/app/3/center/2/access
        [HttpGet("user/{userId}/app/{appId}/center/{centerId}/access")]
        public async Task<ActionResult<bool>> CanAccessCenterInApp(int userId, int appId, int centerId)
        {
            var canAccess = await _permissionService.CanAccessCenterInAppAsync(userId, centerId, appId);
            return Ok(canAccess);
        }
    }

    public class PermissionCheckRequest
    {
        public int UserId { get; set; }
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public int? CenterId { get; set; }
        public int? AppId { get; set; }
    }

    public class PermissionCheckResult
    {
        public bool HasPermission { get; set; }
        public int UserId { get; set; }
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public int? CenterId { get; set; }
        public int? AppId { get; set; }
    }
} 