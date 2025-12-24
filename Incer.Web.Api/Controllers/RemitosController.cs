using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RemitosController : BaseController
    {
        private readonly IRemitoRepository _remitoRepository;

        public RemitosController(IRemitoRepository remitoRepository, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _remitoRepository = remitoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Remito>>> GetRemitos([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET REMITOS ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _remitoRepository.GetQueryable()
                    .Include(r => r.RemitoUsuario)
                        .ThenInclude(ru => ru.Chofer)
                    .Include(r => r.Sucursal)
                        .ThenInclude(s => s.Cliente);

                IQueryable<Remito> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(r => r.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "Sucursal.Cliente.BusinessCenterId");
                }

                var remitos = await query.ToListAsync();
                Console.WriteLine($"Remitos encontrados: {remitos.Count}");
                Console.WriteLine($"===================");

                return Ok(remitos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetRemitos: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Remito>> GetRemito(int id)
        {
            var remito = await _remitoRepository.GetRemitoWithDetailsAsync(id);
            if (remito == null)
            {
                return NotFound();
            }
            return Ok(remito);
        }

        [HttpPost]
        public async Task<ActionResult<Remito>> CreateRemito(Remito remito)
        {
            await _remitoRepository.AddAsync(remito);
            return CreatedAtAction(nameof(GetRemito), new { id = remito.Id }, remito);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRemito(int id, Remito remito)
        {
            if (id != remito.Id)
            {
                return BadRequest();
            }

            await _remitoRepository.UpdateAsync(remito);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRemito(int id)
        {
            var remito = await _remitoRepository.GetByIdAsync(id);
            if (remito == null)
            {
                return NotFound();
            }
            await _remitoRepository.DeleteAsync(remito);
            return NoContent();
        }

        [HttpGet("generar-numero/{choferId}")]
        public async Task<ActionResult<string>> GenerarNumero(int choferId, [FromQuery] string? letra = null, [FromQuery] string? secuencia = null)
        {
            try
            {
                var numero = await _remitoRepository.GenerateNextRemitoNumberAsync(choferId, letra, secuencia);
                return Ok(new { numero });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<Remito>>> GetRemitosBySucursal(int sucursalId)
        {
            var remitos = await _remitoRepository.GetRemitosBySucursalIdAsync(sucursalId);
            return Ok(remitos);
        }

        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<Remito>>> GetRemitosByEstado(EstadoRemito estado)
        {
            var remitos = await _remitoRepository.GetRemitosByEstadoAsync(estado);
            return Ok(remitos);
        }

        [HttpGet("chofer/{choferId}")]
        public async Task<ActionResult<IEnumerable<Remito>>> GetRemitosByChofer(int choferId)
        {
            var remitos = await _remitoRepository.GetRemitosByChoferIdAsync(choferId);
            return Ok(remitos);
        }

        [HttpGet("fecha")]
        public async Task<ActionResult<IEnumerable<Remito>>> GetRemitosByFecha([FromQuery] DateTime fechaDesde, [FromQuery] DateTime fechaHasta)
        {
            var remitos = await _remitoRepository.GetRemitosByFechaAsync(fechaDesde, fechaHasta);
            return Ok(remitos);
        }
    }
}
