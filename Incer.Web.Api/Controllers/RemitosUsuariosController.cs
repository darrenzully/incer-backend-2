using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Api.DTOs;
using System.Security.Claims;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RemitosUsuariosController : BaseController
    {
        private readonly IRemitoUsuarioRepository _remitoUsuarioRepository;
        private readonly ApplicationDbContext _context;

        public RemitosUsuariosController(IRemitoUsuarioRepository remitoUsuarioRepository, ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _remitoUsuarioRepository = remitoUsuarioRepository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RemitoUsuario>>> GetRemitoUsuarios([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET REMITOS USUARIOS ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _remitoUsuarioRepository.GetQueryable()
                    .Include(ru => ru.Chofer)
                        .ThenInclude(c => c.UserCenterAppAccesses);

                IQueryable<RemitoUsuario> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    
                    // Primero verificar cuántos usuarios tienen acceso a este centro
                    var usuariosConAcceso = await _context.UserCenterAppAccesses
                        .Where(uca => uca.BusinessCenterId == centerId.Value && uca.Active)
                        .Select(uca => uca.UserId)
                        .ToListAsync();
                    
                    Console.WriteLine($"Usuarios con acceso al centro {centerId}: {usuariosConAcceso.Count}");
                    Console.WriteLine($"IDs de usuarios: {string.Join(", ", usuariosConAcceso)}");
                    
                    // Verificar cuántos remitos usuarios hay en total
                    var totalRemitosUsuarios = await baseQuery.CountAsync();
                    Console.WriteLine($"Total de remitos usuarios: {totalRemitosUsuarios}");
                    
                    // Si no hay remitos usuarios, verificar si hay datos en la tabla
                    if (totalRemitosUsuarios == 0)
                    {
                        var totalRemitosUsuariosSinInclude = await _remitoUsuarioRepository.GetQueryable().CountAsync();
                        Console.WriteLine($"Total de remitos usuarios sin Include: {totalRemitosUsuariosSinInclude}");
                        
                        if (totalRemitosUsuariosSinInclude > 0)
                        {
                            Console.WriteLine("Hay remitos usuarios pero el Include está fallando");
                        }
                        else
                        {
                            Console.WriteLine("No hay remitos usuarios en la base de datos");
                        }
                    }
                    
                    // Verificar algunos remitos usuarios para debug
                    var sampleRemitos = await baseQuery.Take(3).ToListAsync();
                    foreach (var remito in sampleRemitos)
                    {
                        Console.WriteLine($"Remito ID: {remito.Id}, Chofer ID: {remito.ChoferId}, Chofer: {remito.Chofer?.Mail}");
                        if (remito.Chofer?.UserCenterAppAccesses != null)
                        {
                            Console.WriteLine($"  Centros del chofer: {string.Join(", ", remito.Chofer.UserCenterAppAccesses.Select(uca => $"{uca.BusinessCenterId}({uca.Active})"))}");
                        }
                        else
                        {
                            Console.WriteLine($"  UserCenterAppAccesses es null");
                        }
                    }
                    
                    // Filtrar por usuarios que tienen acceso al centro específico
                    query = baseQuery.Where(ru => ru.Chofer.UserCenterAppAccesses
                        .Any(uca => uca.BusinessCenterId == centerId.Value && uca.Active));
                    
                    // Verificar cuántos remitos usuarios quedan después del filtro
                    var remitosDespuesDelFiltro = await query.CountAsync();
                    Console.WriteLine($"Remitos usuarios después del filtro: {remitosDespuesDelFiltro}");
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    // Obtener los centros accesibles del usuario actual
                    var userId = GetCurrentUserId();
                    Console.WriteLine($"UserId actual: {userId}");
                    
                    if (!userId.HasValue)
                    {
                        Console.WriteLine("Usuario no válido - retornando Unauthorized");
                        return Unauthorized(new { message = "Usuario no válido" });
                    }

                    var userCenters = await _context.UserCenterAppAccesses
                        .Where(uca => uca.UserId == userId.Value && uca.Active)
                        .Select(uca => uca.BusinessCenterId)
                        .ToListAsync();

                    Console.WriteLine($"Centros accesibles del usuario {userId}: {userCenters.Count}");
                    Console.WriteLine($"IDs de centros: {string.Join(", ", userCenters)}");

                    if (!userCenters.Any())
                    {
                        Console.WriteLine("No hay centros accesibles - retornando lista vacía");
                        return Ok(new List<RemitoUsuario>());
                    }

                    // Verificar cuántos remitos usuarios hay en total
                    var totalRemitosUsuarios = await baseQuery.CountAsync();
                    Console.WriteLine($"Total de remitos usuarios: {totalRemitosUsuarios}");

                    query = baseQuery.Where(ru => ru.Chofer.UserCenterAppAccesses
                        .Any(uca => userCenters.Contains(uca.BusinessCenterId) && uca.Active));
                }

                var remitoUsuarios = await query.ToListAsync();
                Console.WriteLine($"Remitos usuarios encontrados: {remitoUsuarios.Count}");
                Console.WriteLine($"=============================");

                return Ok(remitoUsuarios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetRemitoUsuarios: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/[controller]/asignados
        [HttpGet("asignados")]
        public async Task<ActionResult<IEnumerable<RemitosDisponibles>>> GetRemitosAsignados()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int usuarioId))
                {
                    return Unauthorized(new { message = "Usuario no autenticado o ID de usuario inválido." });
                }

                var remitosDisponibles = new List<RemitosDisponibles>();

                var remitosUsuarios = await _remitoUsuarioRepository.GetQueryable()
                    .Where(x => x.ChoferId == usuarioId)
                    .OrderBy(x => x.Letra)
                    .ThenBy(x => x.Secuencia)
                    .ThenBy(x => x.NumeroDesde)
                    .ToListAsync();

                foreach (var remitoUsuario in remitosUsuarios)
                {
                    var remitos = new RemitosDisponibles
                    {
                        Letra = remitoUsuario.Letra ?? string.Empty,
                        Secuencia = remitoUsuario.Secuencia ?? string.Empty,
                        Numeros = new List<int>()
                    };

                    for (int i = remitoUsuario.NumeroDesde; i <= remitoUsuario.NumeroHasta; i++)
                    {
                        var remitoExiste = await _context.Set<Remito>()
                            .AnyAsync(x => x.RemitoUsuarioId == remitoUsuario.Id && x.Numero == i);
                        
                        if (!remitoExiste)
                            remitos.Numeros.Add(i);
                    }

                    var remitoExistente = remitosDisponibles.FirstOrDefault(x => x.Letra == remitos.Letra && x.Secuencia == remitos.Secuencia);
                    if (remitoExistente == null)
                    {
                        remitosDisponibles.Add(remitos);
                    }
                    else
                    {
                        remitoExistente.Numeros.AddRange(remitos.Numeros);
                    }
                }

                return Ok(remitosDisponibles);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetRemitosAsignados: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("debug")]
        public async Task<ActionResult<object>> GetDebugInfo()
        {
            try
            {
                var totalCount = await _remitoUsuarioRepository.GetQueryable().CountAsync();
                var activeCount = await _remitoUsuarioRepository.GetQueryable().Where(ru => ru.Activo).CountAsync();
                
                var sampleData = await _remitoUsuarioRepository.GetQueryable()
                    .Include(ru => ru.Chofer)
                    .Take(3)
                    .Select(ru => new { 
                        ru.Id, 
                        ru.Letra, 
                        ru.Secuencia, 
                        ru.NumeroDesde, 
                        ru.NumeroHasta, 
                        ru.ChoferId,
                        ChoferNombre = ru.Chofer != null ? ru.Chofer.Alias : "Sin chofer",
                        ru.Activo
                    })
                    .ToListAsync();
                
                return Ok(new
                {
                    TotalRemitoUsuarios = totalCount,
                    ActiveRemitoUsuarios = activeCount,
                    SampleData = sampleData,
                    Message = "Debug info para RemitoUsuarios"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("test")]
        public ActionResult<object> GetTest()
        {
            return Ok(new { message = "RemitoUsuariosController está funcionando", timestamp = DateTime.Now });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RemitoUsuario>> GetRemitoUsuario(int id)
        {
            var remitoUsuario = await _remitoUsuarioRepository.GetRemitoUsuarioWithDetailsAsync(id);
            if (remitoUsuario == null)
            {
                return NotFound();
            }
            return Ok(remitoUsuario);
        }

        [HttpPost]
        public async Task<ActionResult<RemitoUsuario>> CreateRemitoUsuario(RemitoUsuario remitoUsuario)
        {
            // Validar que no exista conflicto de rangos de números
            var existeConflicto = await _remitoUsuarioRepository.ExisteRangoNumerosAsync(
                remitoUsuario.ChoferId, 
                remitoUsuario.NumeroDesde, 
                remitoUsuario.NumeroHasta);

            if (existeConflicto)
            {
                return BadRequest("Ya existe una asignación de números que se superpone con el rango especificado para este chofer");
            }

            await _remitoUsuarioRepository.AddAsync(remitoUsuario);
            return CreatedAtAction(nameof(GetRemitoUsuario), new { id = remitoUsuario.Id }, remitoUsuario);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRemitoUsuario(int id, RemitoUsuario remitoUsuario)
        {
            if (id != remitoUsuario.Id)
            {
                return BadRequest();
            }

            // Validar que no exista conflicto de rangos de números (excluyendo el actual)
            var existeConflicto = await _remitoUsuarioRepository.ExisteRangoNumerosAsync(
                remitoUsuario.ChoferId, 
                remitoUsuario.NumeroDesde, 
                remitoUsuario.NumeroHasta, 
                id);

            if (existeConflicto)
            {
                return BadRequest("Ya existe una asignación de números que se superpone con el rango especificado para este chofer");
            }

            await _remitoUsuarioRepository.UpdateAsync(remitoUsuario);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRemitoUsuario(int id)
        {
            var remitoUsuario = await _remitoUsuarioRepository.GetByIdAsync(id);
            if (remitoUsuario == null)
            {
                return NotFound();
            }
            await _remitoUsuarioRepository.DeleteAsync(remitoUsuario);
            return NoContent();
        }

        [HttpGet("chofer/{choferId}")]
        public async Task<ActionResult<IEnumerable<RemitoUsuario>>> GetRemitoUsuariosByChofer(int choferId)
        {
            var remitoUsuarios = await _remitoUsuarioRepository.GetRemitoUsuariosByChoferIdAsync(choferId);
            return Ok(remitoUsuarios);
        }

        [HttpGet("debug/choferes")]
        public async Task<ActionResult<object>> GetDebugChoferes()
        {
            try
            {
                Console.WriteLine("=== DEBUG CHOFERES ===");
                
                // Usar el repositorio para obtener datos
                var remitoUsuarios = await _remitoUsuarioRepository.GetQueryable().ToListAsync();
                var choferIds = remitoUsuarios.Select(ru => ru.ChoferId).Distinct().ToList();
                
                Console.WriteLine($"RemitoUsuarios encontrados: {remitoUsuarios.Count}");
                Console.WriteLine("ChoferIds usados en RemitoUsuarios:");
                foreach (var choferId in choferIds)
                {
                    Console.WriteLine($"  - ChoferId: {choferId}");
                }
                
                Console.WriteLine("=== FIN DEBUG CHOFERES ===");
                
                return Ok(new
                {
                    remitoUsuariosCount = remitoUsuarios.Count,
                    choferIds = choferIds,
                    message = "Debug info - no se puede acceder a Usuarios desde este controlador"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetDebugChoferes: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
