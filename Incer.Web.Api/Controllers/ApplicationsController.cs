using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicationsController : ControllerBase
    {
        private readonly IAppRepository _repository;

        public ApplicationsController(IAppRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<App>>> GetAll()
        {
            var apps = await _repository.GetAllAsync();
            return Ok(apps);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<App>> GetById(int id)
        {
            var app = await _repository.GetByIdAsync(id);
            if (app == null)
            {
                return NotFound();
            }
            return Ok(app);
        }

        [HttpPost]
        public async Task<ActionResult<App>> Create([FromBody] App app)
        {
            if (app == null)
            {
                return BadRequest("Application data is required");
            }

            await _repository.AddAsync(app);
            return CreatedAtAction(nameof(GetById), new { id = app.Id }, app);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] App app)
        {
            if (app == null || id != app.Id)
            {
                return BadRequest();
            }

            var existingApp = await _repository.GetByIdAsync(id);
            if (existingApp == null)
            {
                return NotFound();
            }

            await _repository.UpdateAsync(app);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var app = await _repository.GetByIdAsync(id);
            if (app == null)
            {
                return NotFound();
            }

            await _repository.DeleteAsync(app);
            return NoContent();
        }

        [HttpGet("{id}/permissions")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissions(int id)
        {
            var permissions = await _repository.GetPermissionsByAppIdAsync(id);
            return Ok(permissions);
        }

        [HttpPost("{id}/permissions")]
        public async Task<IActionResult> AssignPermission(int id, [FromBody] int permissionId)
        {
            var success = await _repository.AssignPermissionToAppAsync(id, permissionId);
            if (!success)
            {
                return BadRequest("Failed to assign permission to application");
            }
            return NoContent();
        }

        [HttpDelete("{id}/permissions/{permissionId}")]
        public async Task<IActionResult> RemovePermission(int id, int permissionId)
        {
            var success = await _repository.RemovePermissionFromAppAsync(id, permissionId);
            if (!success)
            {
                return BadRequest("Failed to remove permission from application");
            }
            return NoContent();
        }
    }
}
