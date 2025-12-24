using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BusinessCentersController : BaseController
    {
        private readonly IBusinessCenterRepository _businessCenterRepository;
        private readonly IUserCenterAppAccessRepository _userCenterAppAccessRepository;

        public BusinessCentersController(
            IBusinessCenterRepository businessCenterRepository,
            IUserCenterAppAccessRepository userCenterAppAccessRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _businessCenterRepository = businessCenterRepository;
            _userCenterAppAccessRepository = userCenterAppAccessRepository;
        }

        [HttpGet("accessible")]
        public async Task<ActionResult<IEnumerable<BusinessCenter>>> GetAccessibleCenters()
        {
            try
            {
                var userId = GetCurrentUserId();
                Console.WriteLine($"=== BUSINESS CENTERS ACCESSIBLE DEBUG ===");
                Console.WriteLine($"UserId: {userId}");
                
                if (!userId.HasValue)
                {
                    Console.WriteLine("Usuario no válido - retornando Unauthorized");
                    return Unauthorized(new { message = "Usuario no válido" });
                }

                // Obtener centros accesibles del usuario
                var userCenters = await _userCenterAppAccessRepository.GetByUserIdAsync(userId.Value);
                Console.WriteLine($"UserCenters encontrados: {userCenters.Count()}");
                
                var accessibleCenterIds = userCenters
                    .Where(uca => uca.Active)
                    .Select(uca => uca.BusinessCenterId)
                    .Distinct()
                    .ToList();
                    
                Console.WriteLine($"Centros accesibles IDs: {string.Join(", ", accessibleCenterIds)}");

                if (!accessibleCenterIds.Any())
                {
                    Console.WriteLine("No hay centros accesibles - retornando lista vacía");
                    return Ok(new List<BusinessCenter>());
                }

                // Obtener información de los centros
                var centers = await _businessCenterRepository.GetQueryable()
                    .Where(bc => accessibleCenterIds.Contains(bc.Id) && bc.Activo)
                    .OrderBy(bc => bc.Name)
                    .ToListAsync();
                    
                Console.WriteLine($"Centros encontrados en BD: {centers.Count}");
                foreach (var center in centers)
                {
                    Console.WriteLine($"  - ID: {center.Id}, Nombre: {center.Name}, Activo: {center.Activo}");
                }
                Console.WriteLine($"==========================================");

                return Ok(centers);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetAccessibleCenters: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusinessCenter>>> GetAll()
        {
            try
            {
                var query = _businessCenterRepository.GetQueryable()
                    .Where(bc => bc.Activo)
                    .OrderBy(bc => bc.Name);

                var filteredQuery = await ApplyCenterFilterAsync(query, "Id");
                var centers = await filteredQuery.ToListAsync();

                return Ok(centers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BusinessCenter>> GetById(int id)
        {
            try
            {
                var center = await _businessCenterRepository.GetByIdAsync(id);
                if (center == null)
                {
                    return NotFound();
                }

                return Ok(center);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
