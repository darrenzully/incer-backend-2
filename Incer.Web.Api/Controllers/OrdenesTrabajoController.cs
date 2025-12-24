using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Incer.Web.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdenesTrabajoController : BaseController
    {
        private readonly IOrdenDeTrabajoRepository _ordenTrabajoRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISucursalRepository _sucursalRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPrioridadRepository _prioridadRepository;
        private readonly IRemitoRepository _remitoRepository;

        public OrdenesTrabajoController(
            IOrdenDeTrabajoRepository ordenTrabajoRepository,
            IUnitOfWork unitOfWork,
            ISucursalRepository sucursalRepository,
            IUserRepository userRepository,
            IPrioridadRepository prioridadRepository,
            IRemitoRepository remitoRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _ordenTrabajoRepository = ordenTrabajoRepository;
            _unitOfWork = unitOfWork;
            _sucursalRepository = sucursalRepository;
            _userRepository = userRepository;
            _prioridadRepository = prioridadRepository;
            _remitoRepository = remitoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrdenDeTrabajo>>> GetOrdenesTrabajo([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET ORDENES TRABAJO ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                
                var baseQuery = _ordenTrabajoRepository.GetQueryable()
                    .Include(ot => ot.Sucursal)
                        .ThenInclude(s => s.Cliente)
                            .ThenInclude(c => c.BusinessCenter)
                    .Include(ot => ot.Usuario)
                    .Include(ot => ot.Prioridad)
                    .Include(ot => ot.EstadoDeOT)
                    .Include(ot => ot.Remito);

                IQueryable<OrdenDeTrabajo> query;

                // Si se especifica un centerId, filtrar por ese centro específico
                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando por centro específico: {centerId}");
                    query = baseQuery.Where(ot => ot.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }
                else
                {
                    Console.WriteLine("Aplicando filtro automático de centros accesibles");
                    query = await ApplyCenterFilterAsync(baseQuery, "Sucursal.Cliente.BusinessCenterId");
                }

                var ordenes = await query.ToListAsync();
                Console.WriteLine($"Órdenes de trabajo encontradas: {ordenes.Count}");
                Console.WriteLine($"==============================");

                return Ok(ordenes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetOrdenesTrabajo: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrdenDeTrabajo>> GetOrdenTrabajo(int id)
        {
            var orden = await _ordenTrabajoRepository.GetByIdAsync(id);
            if (orden == null)
            {
                return NotFound();
            }
            return Ok(orden);
        }

        [HttpPost]
        public async Task<ActionResult<OrdenDeTrabajo>> CreateOrdenTrabajo(OrdenDeTrabajo orden)
        {
            try
            {
                // Generar número automáticamente si no se proporciona
                if (orden.Numero == 0)
                {
                    orden.Numero = await _ordenTrabajoRepository.GetNextNumeroAsync();
                }

                orden.FechaCreacion = DateTime.UtcNow;
                orden.UsuarioCreacion = GetCurrentUserId()?.ToString() ?? "system";

                await _ordenTrabajoRepository.AddAsync(orden);
                await _unitOfWork.SaveChangesAsync();

                return CreatedAtAction(nameof(GetOrdenTrabajo), new { id = orden.Id }, orden);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al crear la orden de trabajo", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrdenTrabajo(int id, OrdenDeTrabajo orden)
        {
            if (id != orden.Id)
            {
                return BadRequest();
            }

            try
            {
                var existingOrden = await _ordenTrabajoRepository.GetByIdAsync(id);
                if (existingOrden == null)
                {
                    return NotFound();
                }

                // Actualizar propiedades
                existingOrden.SucursalId = orden.SucursalId;
                existingOrden.UsuarioId = orden.UsuarioId;
                existingOrden.PrioridadId = orden.PrioridadId;
                existingOrden.EstadoDeOTId = orden.EstadoDeOTId;
                existingOrden.FechaIngreso = orden.FechaIngreso;
                existingOrden.FechaRecepcion = orden.FechaRecepcion;
                existingOrden.FechaTerminacion = orden.FechaTerminacion;
                existingOrden.FechaSalida = orden.FechaSalida;
                existingOrden.FechaEntrega = orden.FechaEntrega;
                existingOrden.RemitoId = orden.RemitoId;
                existingOrden.Observaciones = orden.Observaciones;
                existingOrden.FechaUpdate = DateTime.UtcNow;
                existingOrden.UsuarioUpdate = GetCurrentUserId()?.ToString() ?? "system";

                _ordenTrabajoRepository.UpdateAsync(existingOrden);
                await _unitOfWork.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al actualizar la orden de trabajo", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrdenTrabajo(int id)
        {
            try
            {
                var orden = await _ordenTrabajoRepository.GetByIdAsync(id);
                if (orden == null)
                {
                    return NotFound();
                }

                // Borrado lógico
                orden.Activo = false;
                orden.FechaUpdate = DateTime.UtcNow;
                orden.UsuarioUpdate = GetCurrentUserId()?.ToString() ?? "system";

                _ordenTrabajoRepository.UpdateAsync(orden);
                await _unitOfWork.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al eliminar la orden de trabajo", error = ex.Message });
            }
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<OrdenDeTrabajo>>> GetOrdenesBySucursal(int sucursalId)
        {
            var ordenes = await _ordenTrabajoRepository.GetOrdenesBySucursalAsync(sucursalId);
            return Ok(ordenes);
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<OrdenDeTrabajo>>> GetOrdenesByUsuario(int usuarioId)
        {
            var ordenes = await _ordenTrabajoRepository.GetOrdenesByUsuarioAsync(usuarioId);
            return Ok(ordenes);
        }

        [HttpGet("estado/{estadoId}")]
        public async Task<ActionResult<IEnumerable<OrdenDeTrabajo>>> GetOrdenesByEstado(int estadoId)
        {
            var ordenes = await _ordenTrabajoRepository.GetOrdenesByEstadoAsync(estadoId);
            return Ok(ordenes);
        }

        [HttpGet("fecha")]
        public async Task<ActionResult<IEnumerable<OrdenDeTrabajo>>> GetOrdenesByFecha(
            [FromQuery] DateTime fechaDesde, 
            [FromQuery] DateTime fechaHasta)
        {
            var ordenes = await _ordenTrabajoRepository.GetOrdenesByFechaAsync(fechaDesde, fechaHasta);
            return Ok(ordenes);
        }

        [HttpGet("generar-numero")]
        public async Task<ActionResult<object>> GenerarNumero()
        {
            var numero = await _ordenTrabajoRepository.GetNextNumeroAsync();
            return Ok(new { numero });
        }

        // Endpoints para dropdowns
        [HttpGet("dropdowns/sucursales")]
        public async Task<ActionResult<IEnumerable<object>>> GetSucursalesDropdown()
        {
            var sucursales = await _sucursalRepository.GetAllAsync();
            return Ok(sucursales.Select(s => new { s.Id, s.Nombre, Cliente = s.Cliente?.Nombre }));
        }

        [HttpGet("dropdowns/usuarios")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsuariosDropdown()
        {
            var usuarios = await _userRepository.GetAllAsync();
            return Ok(usuarios.Where(u => u.Activo).Select(u => new { u.Id, u.Alias, u.Mail }));
        }

        [HttpGet("dropdowns/prioridades")]
        public async Task<ActionResult<IEnumerable<object>>> GetPrioridadesDropdown()
        {
            var prioridades = await _prioridadRepository.GetAllAsync();
            return Ok(prioridades.Where(p => p.Activo).Select(p => new { p.Id, p.Nombre }));
        }

        [HttpGet("dropdowns/estados")]
        public async Task<ActionResult<IEnumerable<object>>> GetEstadosDropdown()
        {
            // Por ahora retornamos estados hardcodeados, después se puede crear una tabla
            var estados = new[]
            {
                new { Id = 1, Nombre = "Pendiente" },
                new { Id = 2, Nombre = "Proceso" },
                new { Id = 3, Nombre = "Finalizada" },
                new { Id = 4, Nombre = "Entregada" }
            };
            return Ok(estados);
        }

        [HttpGet("dropdowns/remitos")]
        public async Task<ActionResult<IEnumerable<object>>> GetRemitosDropdown()
        {
            var remitos = await _remitoRepository.GetAllAsync();
            return Ok(remitos.Where(r => r.Activo).Select(r => new 
            { 
                r.Id, 
                Numero = $"{r.Letra}{r.Secuencia}{r.Numero.ToString().PadLeft(4, '0')}" 
            }));
        }
    }
}
