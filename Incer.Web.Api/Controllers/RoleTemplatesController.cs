using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoleTemplatesController : BaseController
    {
        private readonly IRoleTemplateRepository _repository;
        private readonly ApplicationDbContext _context;

        public RoleTemplatesController(IRoleTemplateRepository repository, ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor) 
            : base(permissionService, httpContextAccessor)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoleTemplate>>> GetAll()
        {
            var templates = await _repository.GetAllAsync();
            return Ok(templates);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoleTemplate>> GetById(int id)
        {
            var template = await _repository.GetByIdAsync(id);
            if (template == null)
            {
                return NotFound();
            }
            return Ok(template);
        }

        [HttpPost]
        public async Task<ActionResult<RoleTemplate>> Create([FromBody] RoleTemplate template)
        {
            if (template == null)
            {
                return BadRequest("Role template data is required");
            }

            await _repository.AddAsync(template);
            return CreatedAtAction(nameof(GetById), new { id = template.Id }, template);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] RoleTemplate template)
        {
            if (template == null || id != template.Id)
            {
                return BadRequest();
            }

            var existingTemplate = await _repository.GetByIdAsync(id);
            if (existingTemplate == null)
            {
                return NotFound();
            }

            await _repository.UpdateAsync(template);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var template = await _repository.GetByIdAsync(id);
            if (template == null)
            {
                return NotFound();
            }

            await _repository.DeleteAsync(template);
            return NoContent();
        }

        [HttpGet("{id}/permissions")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissions(int id)
        {
            var permissions = await _repository.GetPermissionsByTemplateIdAsync(id);
            return Ok(permissions);
        }

        [HttpPost("{id}/permissions")]
        public async Task<IActionResult> AssignPermission(int id, [FromBody] int permissionId)
        {
            var success = await _repository.AssignPermissionToTemplateAsync(id, permissionId);
            if (!success)
            {
                return BadRequest("Failed to assign permission to role template");
            }
            return NoContent();
        }

        [HttpDelete("{id}/permissions/{permissionId}")]
        public async Task<IActionResult> RemovePermission(int id, int permissionId)
        {
            var success = await _repository.RemovePermissionFromTemplateAsync(id, permissionId);
            if (!success)
            {
                return BadRequest("Failed to remove permission from role template");
            }
            return NoContent();
        }

        [HttpPost("{id}/create-role")]
        public async Task<ActionResult<Role>> CreateRoleFromTemplate(int id, [FromBody] CreateRoleFromTemplateRequest request)
        {
            if (request == null)
            {
                return BadRequest("Role creation data is required");
            }

            var role = await _repository.CreateRoleFromTemplateAsync(id, request.Name, request.Description);
            if (role == null)
            {
                return BadRequest("Failed to create role from template");
            }

            return Ok(role);
        }

        // Nuevos métodos mejorados
        [HttpGet("by-category/{category}")]
        public async Task<ActionResult<IEnumerable<RoleTemplate>>> GetByCategory(string category)
        {
            var templates = await _context.RoleTemplates
                .Where(rt => rt.Category == category && rt.Active)
                .OrderBy(rt => rt.Priority)
                .ToListAsync();
            
            return Ok(templates);
        }

        [HttpGet("system")]
        public async Task<ActionResult<IEnumerable<RoleTemplate>>> GetSystemTemplates()
        {
            var templates = await _context.RoleTemplates
                .Where(rt => rt.IsSystem && rt.Active)
                .OrderBy(rt => rt.Priority)
                .ToListAsync();
            
            return Ok(templates);
        }

        [HttpGet("business")]
        public async Task<ActionResult<IEnumerable<RoleTemplate>>> GetBusinessTemplates()
        {
            var templates = await _context.RoleTemplates
                .Where(rt => rt.Category == "business" && rt.Active)
                .OrderBy(rt => rt.Priority)
                .ToListAsync();
            
            return Ok(templates);
        }

        [HttpGet("{id}/detailed")]
        public async Task<ActionResult<object>> GetDetailed(int id)
        {
            var template = await _context.RoleTemplates
                .Include(rt => rt.RoleTemplatePermissions)
                .ThenInclude(rtp => rtp.Permission)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (template == null)
            {
                return NotFound();
            }

            var result = new
            {
                template.Id,
                template.Name,
                template.Description,
                template.Category,
                template.IsSystem,
                template.Priority,
                template.Active,
                Permissions = template.RoleTemplatePermissions
                    .Where(rtp => rtp.Permission != null)
                    .Select(rtp => new
                    {
                        rtp.Permission.Id,
                        rtp.Permission.Name,
                        rtp.Permission.Description,
                        rtp.Permission.Resource,
                        rtp.Permission.Action,
                        rtp.Permission.Scope
                    })
                    .OrderBy(p => p.Name)
            };

            return Ok(result);
        }

        [HttpPost("{templateId}/apply-to-role/{roleId}")]
        public async Task<IActionResult> ApplyTemplateToRole(int templateId, int roleId)
        {
            // Verificar que la plantilla existe
            var template = await _context.RoleTemplates
                .Include(rt => rt.RoleTemplatePermissions)
                .FirstOrDefaultAsync(rt => rt.Id == templateId);

            if (template == null)
            {
                return NotFound("Template not found");
            }

            // Verificar que el rol existe
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
            {
                return NotFound("Role not found");
            }

            // Obtener permisos actuales del rol
            var existingPermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.PermissionId)
                .ToListAsync();

            // Agregar permisos de la plantilla que no existen
            var newPermissions = new List<RolePermission>();
            foreach (var templatePermission in template.RoleTemplatePermissions)
            {
                if (!existingPermissions.Contains(templatePermission.PermissionId))
                {
                    newPermissions.Add(new RolePermission
                    {
                        RoleId = roleId,
                        PermissionId = templatePermission.PermissionId,
                        IsGranted = true,
                        GrantedAt = DateTime.UtcNow,
                        GrantedBy = GetCurrentUserId() ?? 1,
                        UsuarioCreacion = "system",
                        UsuarioUpdate = "system"
                    });
                }
            }

            if (newPermissions.Any())
            {
                _context.RolePermissions.AddRange(newPermissions);
                await _context.SaveChangesAsync();
            }

            return Ok(new { 
                message = $"Template applied successfully. {newPermissions.Count} permissions added to role.",
                addedPermissions = newPermissions.Count
            });
        }

        [HttpPost("{id}/duplicate")]
        public async Task<ActionResult<RoleTemplate>> DuplicateTemplate(int id, [FromBody] DuplicateTemplateRequest request)
        {
            var originalTemplate = await _context.RoleTemplates
                .Include(rt => rt.RoleTemplatePermissions)
                .FirstOrDefaultAsync(rt => rt.Id == id);

            if (originalTemplate == null)
            {
                return NotFound("Template not found");
            }

            // Crear nueva plantilla
            var newTemplate = new RoleTemplate
            {
                Name = request.Name,
                Description = request.Description,
                Category = originalTemplate.Category,
                IsSystem = false, // Las copias no son del sistema
                Priority = originalTemplate.Priority,
                Active = true,
                UsuarioCreacion = "system",
                UsuarioUpdate = "system"
            };

            _context.RoleTemplates.Add(newTemplate);
            await _context.SaveChangesAsync();

            // Copiar permisos
            var newPermissions = originalTemplate.RoleTemplatePermissions.Select(rtp => new RoleTemplatePermission
            {
                RoleTemplateId = newTemplate.Id,
                PermissionId = rtp.PermissionId,
                UsuarioCreacion = "system",
                UsuarioUpdate = "system"
            }).ToList();

            _context.RoleTemplatePermissions.AddRange(newPermissions);
            await _context.SaveChangesAsync();

            return Ok(newTemplate);
        }
    }

    public class CreateRoleFromTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class DuplicateTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
