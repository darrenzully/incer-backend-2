using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Enums;
using Incer.Web.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ElementosController : BaseController
    {
        private readonly IElementoRepository _repository;
        private readonly ApplicationDbContext _context;

        public ElementosController(IElementoRepository repository, ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Elemento>>> GetAll([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET ELEMENTOS ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _repository.GetQueryable()
                    .Include(e => e.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter);

                IQueryable<Elemento> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(e => e.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "Sucursal.Cliente.BusinessCenterId");
                }

                var elementos = await query.ToListAsync();
                Console.WriteLine($"Elementos encontrados: {elementos.Count}");
                Console.WriteLine($"=====================");

                return Ok(elementos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetAll elementos: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Elemento>> GetById(int id)
        {
            var elemento = await _repository.GetByIdAsync(id);
            if (elemento == null) return NotFound();
            return Ok(elemento);
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<Elemento>>> GetBySucursal(int sucursalId)
        {
            var elementos = await _repository.GetBySucursalIdAsync(sucursalId);
            return Ok(elementos);
        }

        [HttpGet("tipo-elemento/{tipoElementoId}")]
        public async Task<ActionResult<IEnumerable<Elemento>>> GetByTipoElemento(int tipoElementoId)
        {
            var elementos = await _repository.GetByTipoElementoIdAsync(tipoElementoId);
            return Ok(elementos);
        }

        [HttpGet("sucursales")]
        public async Task<ActionResult<IEnumerable<Elemento>>> GetExtintores([FromQuery(Name = "sucursalId")] int[] sucursalId)
        {
            var elementos = await _repository.GetQueryable()
                .Where(x => sucursalId.Contains(x.SucursalId))
                .ToListAsync();

            var tipoDeProducto = (int)TipoDeProductoEnum.InstalacionesFijas;

            var relevamientos = (
                from e in elementos
                join rd in _context.Set<RelevamientoDetalle>() on e.Id equals rd.ProductoId
                join r in _context.Set<Relevamiento>() on rd.RelevamientoId equals r.Id
                where r.TipoDeProductoId == tipoDeProducto
                group r by rd.ProductoId into g
                select new { ElementoId = g.Key, Fecha = g.Max(x => x.Fecha) }
            );

            foreach (var elemento in elementos)
            {
                var fechas = relevamientos.Where(r => r.ElementoId == elemento.Id);

                if (fechas.Count() > 0)
                    elemento.UltimoRelevamiento = fechas.First().Fecha.ToString("dd/MM/yyyy");
            }

            return Ok(elementos);
        }

        [HttpPost]
        public async Task<ActionResult<Elemento>> Create(Elemento elemento)
        {
            await _repository.AddAsync(elemento);
            return CreatedAtAction(nameof(GetById), new { id = elemento.Id }, elemento);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Elemento elemento)
        {
            if (id != elemento.Id) return BadRequest();
            await _repository.UpdateAsync(elemento);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var elemento = await _repository.GetByIdAsync(id);
            if (elemento == null) return NotFound();
            await _repository.DeleteAsync(elemento);
            return Ok(new { message = "Elemento desactivado correctamente" });
        }
    }
}
