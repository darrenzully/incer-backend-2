using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.AspNetCore.WebUtilities;
using Incer.Web.Infrastructure.Data;
using Incer.Web.Api.DTOs;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExtintoresController : BaseController
    {
        private readonly IExtintorRepository _repository;
        private readonly ITipoDeCargaRepository _tipoCargaRepository;
        private readonly ICapacidadRepository _capacidadRepository;
        private readonly IFabricanteRepository _fabricanteRepository;
        private readonly ApplicationDbContext _context;

        public ExtintoresController(
            IExtintorRepository repository,
            ITipoDeCargaRepository tipoCargaRepository,
            ICapacidadRepository capacidadRepository,
            IFabricanteRepository fabricanteRepository,
            ApplicationDbContext context,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _repository = repository;
            _tipoCargaRepository = tipoCargaRepository;
            _capacidadRepository = capacidadRepository;
            _fabricanteRepository = fabricanteRepository;
            _context = context;
        }

        [HttpGet("test")]
        [AllowAnonymous]
        public IActionResult Test()
        {
            return Ok(new { message = "Test endpoint working", timestamp = DateTime.UtcNow });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Extintor>>> GetAll([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET EXTINTORES ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _repository.GetQueryable()
                    .Include(e => e.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter)
                    .Include(e => e.TipoDeCarga)
                    .Include(e => e.Capacidad);

                IQueryable<Extintor> query;

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

                var extintores = await query.ToListAsync();
                Console.WriteLine($"Extintores encontrados: {extintores.Count}");
                Console.WriteLine($"======================");

                return Ok(extintores);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetAll extintores: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Extintor>> GetById(int id)
        {
            var extintor = await _repository.GetQueryable()
                .Include(e => e.Sucursal)
                    .ThenInclude(s => s.Cliente)
                .Include(e => e.TipoDeCarga)
                .Include(e => e.Capacidad)
                .FirstOrDefaultAsync(e => e.Id == id);
            if (extintor == null) return NotFound();
            return Ok(extintor);
        }

        [HttpGet("{sucursalId}/{id}")]
        public async Task<ActionResult<Extintor>> GetExtintor(int sucursalId, int id)
        {
            Extintor extintor = null;

            if (id > 0)
            {
                extintor = await _repository.GetByIdAsync(id);
            }
            else
            {
                var qr = GetValueString(Request, "qr");
                if (qr != null)
                {
                    var extintores = await _repository.GetQueryable()
                        .Where(x => x.Codigo == qr && x.SucursalId == sucursalId)
                        .ToListAsync();

                    if (extintores.Count() > 0)
                        extintor = extintores.First();
                }

                var nroSerie = GetValueString(Request, "nroSerie");
                if (nroSerie != null)
                {
                    var extintores = await _repository.GetQueryable()
                        .Where(x => x.NroSerie == nroSerie && x.SucursalId == sucursalId)
                        .ToListAsync();

                    if (extintores.Count() > 0)
                        extintor = extintores.First();
                }
            }

            if (extintor != null)
                return Ok(extintor);
            else
                throw new Exception("No se encuentra el extintor indicado.");
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<Extintor>>> GetBySucursal(int sucursalId)
        {
            var extintores = await _repository.GetBySucursalIdAsync(sucursalId);
            return Ok(extintores);
        }

        [HttpGet("cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<Extintor>>> GetByCliente(int clienteId)
        {
            var extintores = await _repository.GetByClienteIdAsync(clienteId);
            return Ok(extintores);
        }

        [HttpGet("sucursales")]
        public async Task<ActionResult<IEnumerable<Extintor>>> GetExtintores([FromQuery(Name = "sucursalId")] int[] sucursalId)
        {
            if (sucursalId is null || sucursalId.Length == 0)
            {
                return BadRequest("At least 1 sucursalId is required.");
            }

            var extintores = await _repository.GetQueryable()
                .Where(x => x.SucursalId != null && sucursalId.Contains(x.SucursalId.Value))
                .ToListAsync();

            return Ok(extintores);
        }

        [HttpPost]
        public async Task<ActionResult<Extintor>> Create(Extintor extintor)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            // Los campos de BaseEntity se llenan automáticamente
            // Solo necesitamos asegurar que FechaCreacion esté actualizada
            extintor.FechaCreacion = DateTime.UtcNow;
            
            await _repository.AddAsync(extintor);
            return CreatedAtAction(nameof(GetById), new { id = extintor.Id }, extintor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Extintor extintor)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            if (id != extintor.Id) return BadRequest();
            
            // Solo necesitamos actualizar FechaUpdate
            extintor.FechaUpdate = DateTime.UtcNow;
            
            await _repository.UpdateAsync(extintor);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var extintor = await _repository.GetByIdAsync(id);
            if (extintor == null) return NotFound();
            await _repository.DeleteAsync(extintor);
            return Ok(new { message = "Extintor desactivado correctamente" });
        }

        [HttpGet("tipos-carga")]
        public async Task<ActionResult<IEnumerable<TipoDeCarga>>> GetTiposCarga()
        {
            var tipos = await _tipoCargaRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("capacidades")]
        public async Task<ActionResult<IEnumerable<Capacidad>>> GetCapacidades()
        {
            var capacidades = await _capacidadRepository.GetAllAsync();
            return Ok(capacidades);
        }

        [HttpGet("fabricantes")]
        public async Task<ActionResult<IEnumerable<Fabricante>>> GetFabricantes()
        {
            var fabricantes = await _fabricanteRepository.GetAllAsync();
            return Ok(fabricantes);
        }

        [HttpGet("clientes/combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetClientes()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "Usuario no autenticado" });

                var accessibleCenters = await _permissionService.GetUserAccessibleCentersAsync(userId.Value);

                var clientesId = _context.Set<Extintor>()
                    .Select(x => x.ClienteId)
                    .Distinct();

                var result = _context.Set<Cliente>()
                    .Where(x => clientesId.Contains(x.Id) && accessibleCenters.Contains(x.BusinessCenterId));

                var clientes = await result
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();

                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("reservas")]
        public async Task<ActionResult<IEnumerable<Extintor>>> GetReservas()
        {
            try
            {
                var query = _repository.GetQueryable()
                    .Include(e => e.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter)
                    .Where(x => x.Reserva);

                var filteredQuery = await ApplyCenterFilterAsync(query, "Sucursal.Cliente.BusinessCenterId");
                var extintores = await filteredQuery.ToListAsync();

                return Ok(extintores);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        private string GetValueString(HttpRequest request, string param)
        {
            string ret = null;

            var queryDictionary = QueryHelpers.ParseQuery(request.QueryString.Value);

            if (queryDictionary.Count > 0)
            {
                if (queryDictionary.Any(x => x.Key.Equals(param)) && !string.IsNullOrEmpty(queryDictionary[param][0]))
                    ret = queryDictionary[param].ToString();
            }

            return ret;
        }
    }
}
