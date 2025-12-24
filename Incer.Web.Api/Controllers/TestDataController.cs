using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;
using Incer.Web.Core.Entities;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestDataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestDataController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/testdata/applications
        [HttpGet("applications")]
        public async Task<ActionResult<IEnumerable<object>>> GetApplications()
        {
            var applications = await _context.Applications
                .Where(a => a.Active)
                .Select(a => new { a.Id, a.Name, a.Code, a.Type })
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/testdata/businesscenters
        [HttpGet("businesscenters")]
        public async Task<ActionResult<IEnumerable<object>>> GetBusinessCenters()
        {
            var businessCenters = await _context.BusinessCenters
                .Where(bc => bc.Activo)
                .Select(bc => new { 
                    bc.Id, 
                    bc.Name, 
                    bc.Description
                })
                .ToListAsync();

            return Ok(businessCenters);
        }

        // GET: api/testdata/roles
        [HttpGet("roles")]
        public async Task<ActionResult<IEnumerable<object>>> GetRoles()
        {
            var roles = await _context.Roles
                .Where(r => r.Activo)
                .Select(r => new { r.Id, r.Name, r.Description, r.IsSystem })
                .ToListAsync();

            return Ok(roles);
        }

        // POST: api/testdata/seed-applications
        [HttpPost("seed-applications")]
        public async Task<ActionResult> SeedApplications()
        {
            try
            {
                // Verificar si ya existen aplicaciones
                if (await _context.Applications.AnyAsync())
                {
                    return Ok(new { message = "Applications already exist" });
                }

                var applications = new List<App>
                {
                    new App
                    {
                        Name = "Web Application",
                        Code = "web",
                        Type = "web",
                        Platform = "web",
                        Active = true,
                        Version = "1.0.0",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    },
                    new App
                    {
                        Name = "Mobile Internal",
                        Code = "mobile-internal",
                        Type = "mobile",
                        Platform = "ios",
                        Active = true,
                        Version = "1.2.0",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    },
                    new App
                    {
                        Name = "Mobile External",
                        Code = "mobile-external",
                        Type = "mobile",
                        Platform = "android",
                        Active = true,
                        Version = "2.0.0",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    },
                    new App
                    {
                        Name = "API Service",
                        Code = "api",
                        Type = "api",
                        Platform = null,
                        Active = true,
                        Version = "1.5.0",
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    }
                };

                _context.Applications.AddRange(applications);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Applications seeded successfully", count = applications.Count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error seeding applications", error = ex.Message });
            }
        }

        // POST: api/testdata/seed-role-templates
        [HttpPost("seed-role-templates")]
        public async Task<ActionResult> SeedRoleTemplates()
        {
            try
            {
                // Verificar si ya existen plantillas
                if (await _context.RoleTemplates.AnyAsync())
                {
                    return Ok(new { message = "Role templates already exist" });
                }

                var roleTemplates = new List<RoleTemplate>
                {
                    new RoleTemplate
                    {
                        Name = "Administrator Template",
                        Description = "Full system access template",
                        Category = "system",
                        IsSystem = true,
                        Priority = 1,
                        Active = true,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    },
                    new RoleTemplate
                    {
                        Name = "Manager Template",
                        Description = "Management level access template",
                        Category = "business",
                        IsSystem = false,
                        Priority = 2,
                        Active = true,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    },
                    new RoleTemplate
                    {
                        Name = "User Template",
                        Description = "Standard user access template",
                        Category = "business",
                        IsSystem = false,
                        Priority = 3,
                        Active = true,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    },
                    new RoleTemplate
                    {
                        Name = "Read Only Template",
                        Description = "Read-only access template",
                        Category = "custom",
                        IsSystem = false,
                        Priority = 4,
                        Active = true,
                        Activo = true,
                        FechaCreacion = DateTime.UtcNow
                    }
                };

                _context.RoleTemplates.AddRange(roleTemplates);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Role templates seeded successfully", count = roleTemplates.Count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error seeding role templates", error = ex.Message });
            }
        }
    }
}
