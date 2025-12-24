using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Incer.Web.Core.Enums;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PuestosController : BaseController
    {
        private readonly IPuestoRepository _repository;
        private readonly ApplicationDbContext _context;

        public PuestosController(IPuestoRepository repository, ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetAll([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET PUESTOS ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _repository.GetQueryable()
                    .Include(p => p.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter);

                IQueryable<Puesto> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(p => p.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "Sucursal.Cliente.BusinessCenterId");
                }

                var puestos = await query.ToListAsync();
                Console.WriteLine($"Puestos encontrados: {puestos.Count}");
                Console.WriteLine($"===================");

                return Ok(puestos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetAll puestos: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Puesto>> GetById(int id)
        {
            var puesto = await _repository.GetByIdAsync(id);
            if (puesto == null) return NotFound();
            return Ok(puesto);
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetBySucursal(int sucursalId)
        {
            var puestos = await _repository.GetBySucursalIdAsync(sucursalId);
            return Ok(puestos);
        }

        [HttpGet("extintor/{extintorId}")]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetByExtintor(int extintorId)
        {
            var puestos = await _repository.GetByExtintorIdAsync(extintorId);
            return Ok(puestos);
        }

        [HttpGet("sucursales")]
        public async Task<ActionResult<IEnumerable<Puesto>>> GetPuestos([FromQuery(Name = "sucursalId")] int[] sucursalId)
        {
            if (sucursalId is null || sucursalId.Length == 0)
            {
                return BadRequest("At least 1 sucursalId is required.");
            }

            var puestos = await _repository.GetQueryable()
                .Where(x => sucursalId.Contains(x.SucursalId) && !x.Deshabilitado)
                .ToListAsync();

            var tipoDeProducto = (int)TipoDeProductoEnum.Puestos;

            var relevamientos = (
                from p in puestos
                join rd in _context.Set<RelevamientoDetalle>() on p.Id equals rd.PuestoId
                join r in _context.Set<Relevamiento>() on rd.RelevamientoId equals r.Id
                where r.TipoDeProductoId == tipoDeProducto
                group r by rd.PuestoId into g
                select new { PuestoId = g.Key, Fecha = g.Max(x => x.Fecha) }
            );

            foreach (var puesto in puestos.ToList())
            {
                var fechas = relevamientos.Where(r => r.PuestoId == puesto.Id);

                if (fechas.Count() > 0)
                    puesto.UltimoRelevamiento = fechas.First().Fecha.ToString("dd/MM/yyyy");
            }

            return Ok(puestos);
        }

        [HttpPost]
        public async Task<ActionResult<Puesto>> Create(Puesto puesto)
        {
            await _repository.AddAsync(puesto);
            return CreatedAtAction(nameof(GetById), new { id = puesto.Id }, puesto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Puesto puesto)
        {
            if (id != puesto.Id) return BadRequest();
            await _repository.UpdateAsync(puesto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var puesto = await _repository.GetByIdAsync(id);
            if (puesto == null) return NotFound();
            await _repository.DeleteAsync(puesto);
            return Ok(new { message = "Puesto desactivado correctamente" });
        }
    }
}
