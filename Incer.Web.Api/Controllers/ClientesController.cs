using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Api.DTOs;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientesController : BaseController
    {
        private readonly IClienteRepository _clienteRepository;
        private readonly ITipoDeClienteRepository _tipoDeClienteRepository;
        private readonly ITipoDeServicioRepository _tipoDeServicioRepository;
        private readonly ITipoProductoRepository _tipoProductoRepository;

        private readonly IPeriodicidadRepository _periodicidadRepository;
        private readonly IBusinessCenterRepository _businessCenterRepository;
        private readonly IUserRepository _userRepository;
        private readonly ApplicationDbContext _dbContext;

        public ClientesController(
            IClienteRepository clienteRepository,
            ITipoDeClienteRepository tipoDeClienteRepository,
            ITipoDeServicioRepository tipoDeServicioRepository,
            ITipoProductoRepository tipoProductoRepository,
            IPeriodicidadRepository periodicidadRepository,
            IBusinessCenterRepository businessCenterRepository,
            IUserRepository userRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext dbContext)
            : base(permissionService, httpContextAccessor)
        {
            _clienteRepository = clienteRepository;
            _tipoDeClienteRepository = tipoDeClienteRepository;
            _tipoDeServicioRepository = tipoDeServicioRepository;
            _tipoProductoRepository = tipoProductoRepository;
            _periodicidadRepository = periodicidadRepository;
            _businessCenterRepository = businessCenterRepository;
            _userRepository = userRepository;
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetAll([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET CLIENTES ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _clienteRepository.GetQueryable()
                    .Include(c => c.BusinessCenter)
                    .Include(c => c.TipoDeCliente)
                    .Include(c => c.TipoDeServicio)
                    .Include(c => c.Vendedor);

                IQueryable<Cliente> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(c => c.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "BusinessCenterId");
                }

                var clientes = await query.ToListAsync();
                Console.WriteLine($"Clientes encontrados: {clientes.Count}");
                Console.WriteLine($"====================");

                return Ok(clientes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetAll clientes: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetAllForAdmin([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET CLIENTES ADMIN ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _clienteRepository.GetQueryable()
                    .Include(c => c.BusinessCenter)
                    .Include(c => c.TipoDeCliente)
                    .Include(c => c.TipoDeServicio)
                    .Include(c => c.Vendedor)
                    .Include(c => c.Alcances)
                    .Include(c => c.AlcancesDetalles);

                IQueryable<Cliente> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(c => c.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "BusinessCenterId");
                }

                var clientes = await query.ToListAsync();
                Console.WriteLine($"Clientes encontrados: {clientes.Count}");
                Console.WriteLine($"====================");

                return Ok(clientes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetAllForAdmin clientes: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetById(int id)
        {
            var cliente = await _clienteRepository.GetClienteWithDetailsAsync(id);
            if (cliente == null) return NotFound();
            return Ok(cliente);
        }

        [HttpGet("vendedor/{vendedorId}")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetByVendedor(int vendedorId)
        {
            var clientes = await _clienteRepository.GetClientesByVendedorAsync(vendedorId);
            return Ok(clientes);
        }

        [HttpGet("centro/{centroId}")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetByCentro(int centroId)
        {
            var clientes = await _clienteRepository.GetClientesByCentroAsync(centroId);
            return Ok(clientes);
        }

        [HttpPost]
        public async Task<ActionResult<Cliente>> Create(Cliente cliente)
        {
            await _clienteRepository.AddAsync(cliente);
            return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Cliente cliente)
        {
            if (id != cliente.Id) return BadRequest();
            await _clienteRepository.UpdateAsync(cliente);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var cliente = await _clienteRepository.GetByIdAsync(id);
            if (cliente == null) return NotFound();
            await _clienteRepository.DeleteAsync(cliente);
            return Ok(new { message = "Cliente desactivado correctamente" });
        }

        [HttpPut("{id}/reactivar")]
        public async Task<IActionResult> Reactivar(int id)
        {
            var cliente = await _clienteRepository.GetByIdForAdminAsync(id);
            if (cliente == null) return NotFound();

            cliente.Activo = true;
            cliente.FechaUpdate = DateTime.UtcNow;
            await _clienteRepository.UpdateAsync(cliente);
            return Ok(new { message = "Cliente reactivado correctamente" });
        }

        [HttpGet("tipos-cliente")]
        public async Task<ActionResult<IEnumerable<TipoDeCliente>>> GetTiposCliente()
        {
            var tipos = await _tipoDeClienteRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("tipos-servicio")]
        public async Task<ActionResult<IEnumerable<TipoDeServicio>>> GetTiposServicio()
        {
            var tipos = await _tipoDeServicioRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("centros")]
        public async Task<ActionResult<IEnumerable<BusinessCenter>>> GetCentros()
        {
            var centros = await _businessCenterRepository.GetAllAsync();
            return Ok(centros);
        }

        [HttpGet("vendedores")]
        public async Task<ActionResult<IEnumerable<User>>> GetVendedores()
        {
            var vendedores = await _userRepository.GetAllAsync();
            return Ok(vendedores);
        }

        [HttpGet("tipos-producto")]
        public async Task<ActionResult<IEnumerable<TipoDeProducto>>> GetTiposProducto()
        {
            var tipos = await _tipoProductoRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("periodicidades")]
        public async Task<ActionResult<IEnumerable<Periodicidad>>> GetPeriodicidades()
        {
            var periodicidades = await _periodicidadRepository.GetAllAsync();
            return Ok(periodicidades);
        }

        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList([FromQuery] bool? isMobile = true)
        {
            try
            {
                Console.WriteLine($"=== GET CLIENTES COMBOLIST ===");
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    Console.WriteLine("Usuario no autenticado");
                    return Unauthorized(new { message = "Usuario no autenticado" });
                }

                Console.WriteLine($"Usuario ID: {userId.Value}");

                // SOLO obtener clientes asignados directamente al usuario (UserClientAccess)
                // NO incluir clientes de centros asignados - solo los clientes explícitamente asignados
                var directClientAccesses = await _dbContext.UserClientAccesses
                    .Where(uca => uca.UserId == userId.Value && 
                                 uca.Active && 
                                 uca.Activo &&
                                 (uca.ExpiresAt == null || uca.ExpiresAt > DateTime.UtcNow))
                    .Select(uca => uca.ClienteId)
                    .Distinct()
                    .ToListAsync();

                Console.WriteLine($"Clientes asignados directamente al usuario: {directClientAccesses.Count}");
                foreach (var clienteId in directClientAccesses)
                {
                    Console.WriteLine($"  - Cliente ID: {clienteId}");
                }

                var resultClientes = new List<ComboList>();
                if (directClientAccesses.Any())
                {
                    resultClientes = await _clienteRepository.GetQueryable()
                        .Where(c => c.Activo && directClientAccesses.Contains(c.Id))
                        .Select(c => new ComboList
                        {
                            Id = c.Id,
                            Nombre = c.Nombre
                        })
                        .OrderBy(c => c.Nombre)
                        .ToListAsync();

                    Console.WriteLine($"Clientes encontrados y activos: {resultClientes.Count}");
                }
                else
                {
                    Console.WriteLine("No se encontraron clientes asignados directamente al usuario");
                }

                Console.WriteLine($"Total clientes en combolist: {resultClientes.Count}");
                Console.WriteLine($"=============================");

                return Ok(resultClientes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetComboList clientes: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
} 