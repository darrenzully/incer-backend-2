using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Api.DTOs;
using Incer.Web.Infrastructure.Data;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SucursalesController : BaseController
    {
        private readonly ISucursalRepository _sucursalRepository;
        private readonly ILocalidadRepository _localidadRepository;
        private readonly IProvinciaRepository _provinciaRepository;
        private readonly IPaisRepository _paisRepository;
        private readonly IClienteRepository _clienteRepository;
        private readonly ApplicationDbContext _dbContext;

        public SucursalesController(
            ISucursalRepository sucursalRepository,
            ILocalidadRepository localidadRepository,
            IProvinciaRepository provinciaRepository,
            IPaisRepository paisRepository,
            IClienteRepository clienteRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext dbContext)
            : base(permissionService, httpContextAccessor)
        {
            _sucursalRepository = sucursalRepository;
            _localidadRepository = localidadRepository;
            _provinciaRepository = provinciaRepository;
            _paisRepository = paisRepository;
            _clienteRepository = clienteRepository;
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sucursal>>> GetAll([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET SUCURSALES ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _sucursalRepository.GetQueryable()
                    .Include(s => s.Cliente)
                        .ThenInclude(c => c.BusinessCenter);

                IQueryable<Sucursal> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(s => s.Cliente.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "Cliente.BusinessCenterId");
                }

                var sucursales = await query.ToListAsync();
                Console.WriteLine($"Sucursales encontradas: {sucursales.Count}");
                Console.WriteLine($"=======================");

                return Ok(sucursales);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetAll sucursales: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }



        [HttpGet("{id:int}")]
        public async Task<ActionResult<Sucursal>> GetById(int id)
        {
            var sucursal = await _sucursalRepository.GetByIdAsync(id);
            if (sucursal == null)
                return NotFound();

            return Ok(sucursal);
        }

        // Compatibilidad: el frontend llama /api/Sucursales/cliente?clienteId=...&centerId=...
        [HttpGet("cliente")]
        public async Task<ActionResult<IEnumerable<Sucursal>>> GetByClienteIdQuery([FromQuery] int clienteId, [FromQuery] int? centerId = null)
        {
            if (clienteId <= 0)
                return BadRequest(new { message = "Debe indicar clienteId" });

            var baseQuery = _sucursalRepository.GetQueryable()
                .Include(s => s.Cliente)
                    .ThenInclude(c => c.BusinessCenter)
                .Where(s => s.ClienteId == clienteId && s.Activo);

            IQueryable<Sucursal> query;
            if (centerId.HasValue)
            {
                query = baseQuery.Where(s => s.Cliente.BusinessCenterId == centerId.Value);
            }
            else
            {
                query = await ApplyCenterFilterAsync(baseQuery, "Cliente.BusinessCenterId");
            }

            var sucursales = await query.ToListAsync();
            return Ok(sucursales);
        }

        [HttpGet("cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<Sucursal>>> GetByClienteId(int clienteId)
        {
            var sucursales = await _sucursalRepository.GetByClienteIdAsync(clienteId);
            return Ok(sucursales);
        }

        [HttpGet("activas")]
        public async Task<ActionResult<IEnumerable<Sucursal>>> GetActivas()
        {
            var sucursales = await _sucursalRepository.GetActivasAsync();
            return Ok(sucursales);
        }

        [HttpPost]
        public async Task<ActionResult<Sucursal>> Create(Sucursal sucursal)
        {
            await _sucursalRepository.AddAsync(sucursal);
            return CreatedAtAction(nameof(GetById), new { id = sucursal.Id }, sucursal);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Sucursal sucursal)
        {
            if (id != sucursal.Id)
                return BadRequest();

            await _sucursalRepository.UpdateAsync(sucursal);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sucursal = await _sucursalRepository.GetByIdAsync(id);
            if (sucursal == null)
                return NotFound();

            await _sucursalRepository.DeleteAsync(sucursal);
            return Ok(new { message = "Sucursal desactivada correctamente" });
        }

        [HttpPut("{id}/reactivar")]
        public async Task<IActionResult> Reactivar(int id)
        {
            var sucursal = await _sucursalRepository.GetByIdForAdminAsync(id);
            if (sucursal == null)
                return NotFound();

            sucursal.Activo = true;
            sucursal.FechaUpdate = DateTime.UtcNow;
            await _sucursalRepository.UpdateAsync(sucursal);
            return Ok(new { message = "Sucursal reactivada correctamente" });
        }

        [HttpGet("localidades/{provinciaId}")]
        public async Task<ActionResult<IEnumerable<Localidad>>> GetLocalidadesByProvincia(int provinciaId)
        {
            var localidades = await _localidadRepository.GetByProvinciaIdAsync(provinciaId);
            return Ok(localidades);
        }

        [HttpGet("provincias/{paisId}")]
        public async Task<ActionResult<IEnumerable<Provincia>>> GetProvinciasByPais(int paisId)
        {
            var provincias = await _provinciaRepository.GetByPaisIdAsync(paisId);
            return Ok(provincias);
        }

        [HttpGet("paises")]
        public async Task<ActionResult<IEnumerable<Pais>>> GetPaises()
        {
            var paises = await _paisRepository.GetAllAsync();
            return Ok(paises);
        }

        [HttpGet("provincias")]
        public async Task<ActionResult<IEnumerable<Provincia>>> GetProvincias()
        {
            var provincias = await _provinciaRepository.GetAllAsync();
            return Ok(provincias);
        }

        [HttpGet("localidades")]
        public async Task<ActionResult<IEnumerable<Localidad>>> GetLocalidades()
        {
            var localidades = await _localidadRepository.GetAllAsync();
            return Ok(localidades);
        }

        [HttpGet("clientes")]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized(new { message = "Usuario no autenticado" });

                // Usar el sistema de filtrado por centros del BaseController
                var query = _clienteRepository.GetQueryable()
                    .Where(c => c.Activo);

                // Aplicar filtro por centros accesibles
                var filteredQuery = await ApplyCenterFilterAsync(query, "BusinessCenterId");
                
                var clientes = await filteredQuery.ToListAsync();
                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }


        [HttpGet("combo-data")]
        public async Task<ActionResult<object>> GetComboData()
        {
            try
            {
                var paises = await _paisRepository.GetAllAsync();
                var provincias = await _provinciaRepository.GetAllAsync();
                var localidades = await _localidadRepository.GetAllAsync();
                var clientes = await _clienteRepository.GetAllAsync();
                var sucursales = await _sucursalRepository.GetActivasAsync();

                var comboData = new
                {
                    Paises = paises.Select(p => new
                    {
                        p.Id,
                        p.Nombre,
                        p.Codigo,
                        Provincias = provincias
                            .Where(prov => prov.PaisId == p.Id && prov.Activo)
                            .Select(prov => new
                            {
                                prov.Id,
                                prov.Nombre,
                                prov.Codigo,
                                Localidades = localidades
                                    .Where(loc => loc.ProvinciaId == prov.Id && loc.Activo)
                                    .Select(loc => new
                                    {
                                        loc.Id,
                                        loc.Nombre
                                    }).ToList()
                            }).ToList()
                    }).ToList(),
                    Clientes = clientes
                        .Where(c => c.Activo)
                        .Select(c => new
                        {
                            c.Id,
                            c.Nombre,
                            c.RazonSocial,
                            Sucursales = sucursales
                                .Where(s => s.ClienteId == c.Id)
                                .Select(s => new
                                {
                                    s.Id,
                                    s.Nombre,
                                    s.Direccion,
                                    s.Telefono,
                                    s.Mail,
                                    Localidad = new
                                    {
                                        s.Localidad!.Id,
                                        s.Localidad.Nombre,
                                        Provincia = new
                                        {
                                            s.Localidad.Provincia!.Id,
                                            s.Localidad.Provincia.Nombre,
                                            Pais = new
                                            {
                                                s.Localidad.Provincia.Pais!.Id,
                                                s.Localidad.Provincia.Pais.Nombre
                                            }
                                        }
                                    }
                                }).ToList()
                        }).ToList()
                };

                return Ok(comboData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("combo-data-simple")]
        public async Task<ActionResult<object>> GetComboDataSimple()
        {
            try
            {
                var paises = await _paisRepository.GetAllAsync();
                var provincias = await _provinciaRepository.GetAllAsync();
                var localidades = await _localidadRepository.GetAllAsync();
                var clientes = await _clienteRepository.GetAllAsync();

                var comboData = new
                {
                    Paises = paises
                        .Where(p => p.Activo)
                        .Select(p => new { p.Id, p.Nombre, p.Codigo })
                        .OrderBy(p => p.Nombre)
                        .ToList(),
                    Provincias = provincias
                        .Where(p => p.Activo)
                        .Select(p => new { p.Id, p.Nombre, p.Codigo, p.PaisId })
                        .OrderBy(p => p.Nombre)
                        .ToList(),
                    Localidades = localidades
                        .Where(l => l.Activo)
                        .Select(l => new { l.Id, l.Nombre, l.ProvinciaId })
                        .OrderBy(l => l.Nombre)
                        .ToList(),
                    Clientes = clientes
                        .Where(c => c.Activo)
                        .Select(c => new { c.Id, c.Nombre, c.RazonSocial })
                        .OrderBy(c => c.Nombre)
                        .ToList()
                };

                return Ok(comboData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("by-cliente/{clienteId}/with-details")]
        public async Task<ActionResult<IEnumerable<object>>> GetByClienteIdWithDetails(int clienteId)
        {
            try
            {
                var sucursales = await _sucursalRepository.GetByClienteIdAsync(clienteId);
                
                var sucursalesWithDetails = new List<object>();
                
                foreach (var sucursal in sucursales)
                {
                    var sucursalDetail = new
                    {
                        sucursal.Id,
                        sucursal.Nombre,
                        sucursal.Direccion,
                        sucursal.Telefono,
                        sucursal.Mail,
                        sucursal.ClienteId,
                        ClienteNombre = sucursal.Cliente?.Nombre ?? "N/A",
                        ClienteRazonSocial = sucursal.Cliente?.RazonSocial ?? "N/A",
                        LocalidadNombre = sucursal.Localidad?.Nombre ?? "N/A",
                        ProvinciaNombre = sucursal.Localidad?.Provincia?.Nombre ?? "N/A",
                        PaisNombre = sucursal.Localidad?.Provincia?.Pais?.Nombre ?? "N/A"
                    };
                    
                    sucursalesWithDetails.Add(sucursalDetail);
                }

                return Ok(sucursalesWithDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboListSucursales>>> GetComboList()
        {
            try
            {
                Console.WriteLine($"=== GET SUCURSALES COMBOLIST ===");
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                {
                    Console.WriteLine("Usuario no autenticado");
                    return Unauthorized(new { message = "Usuario no autenticado" });
                }

                Console.WriteLine($"Usuario ID: {userId.Value}");

                // SOLO obtener clientes asignados directamente al usuario (UserClientAccess)
                // Luego obtener las sucursales de esos clientes
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

                var resultSucursales = new List<ComboListSucursales>();
                if (directClientAccesses.Any())
                {
                    resultSucursales = await _sucursalRepository.GetQueryable()
                        .Where(s => s.Activo && directClientAccesses.Contains(s.ClienteId))
                        .Select(s => new ComboListSucursales
                        {
                            Id = s.Id,
                            Nombre = s.Nombre,
                            ClienteId = s.ClienteId
                        })
                        .OrderBy(s => s.Nombre)
                        .ToListAsync();

                    Console.WriteLine($"Sucursales encontradas de los clientes asignados: {resultSucursales.Count}");
                }
                else
                {
                    Console.WriteLine("No se encontraron clientes asignados directamente al usuario");
                }

                Console.WriteLine($"Total sucursales en combolist: {resultSucursales.Count}");
                Console.WriteLine($"===============================");

                return Ok(resultSucursales);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetComboList sucursales: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
} 