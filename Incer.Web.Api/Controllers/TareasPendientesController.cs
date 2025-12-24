using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Core.Enums;
using Incer.Web.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TareasPendientesController : ControllerBase
    {
        private readonly ITareaRepository _tareaRepository;
        private readonly IRelevamientoRepository _relevamientoRepository;
        private readonly ISucursalRepository _sucursalRepository;
        private readonly IClienteRepository _clienteRepository;

        public TareasPendientesController(
            ITareaRepository tareaRepository,
            IRelevamientoRepository relevamientoRepository,
            ISucursalRepository sucursalRepository,
            IClienteRepository clienteRepository)
        {
            _tareaRepository = tareaRepository;
            _relevamientoRepository = relevamientoRepository;
            _sucursalRepository = sucursalRepository;
            _clienteRepository = clienteRepository;
        }

        // GET: api/TareasPendientes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TareaPendiente>>> GetAllEntities([FromQuery] int days = 1)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int usuarioId))
                {
                    return Unauthorized(new { message = "Usuario no autenticado" });
                }

                var tipoDeTareaSolicitudId = (int)TipoDeTareaEnum.Solicitud;
                var estadoDeTareaAsignadaId = (int)EstadoDeTarea.Asignada;
                var rangoFechaDesde = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
                var rangoFechaHasta = DateTime.Now.AddDays(days);

                var tareas = new List<TareaPendiente>();

                // Obtiene listado de solicitudes asignadas
                var solicitudes = await _tareaRepository.GetQueryable()
                    .Where(t => t.TipoDeTareaId == tipoDeTareaSolicitudId
                        && t.EstadoTareaId == estadoDeTareaAsignadaId
                        && t.UsuarioId == usuarioId
                        && t.Fecha >= rangoFechaDesde
                        && t.Fecha <= rangoFechaHasta)
                    .Include(t => t.Sucursal)
                        .ThenInclude(s => s.Cliente)
                    .Select(t => new TareaPendiente
                    {
                        TareaId = t.Id,
                        RelevamientoId = null,
                        Cliente = t.Sucursal.Cliente.Nombre ?? string.Empty,
                        SucursalId = t.SucursalId,
                        Sucursal = t.Sucursal.Nombre ?? string.Empty,
                        Fecha = t.Fecha,
                        TipoDeTareaId = (int)TipoDeTareaEnum.Solicitud,
                        TipoDeTarea = TipoDeTareaEnum.Solicitud.ToString()
                    })
                    .ToListAsync();

                // Obtiene listado de relevamientos asignados
                var relevamientos = await _relevamientoRepository.GetQueryable()
                    .Where(r => r.EstadoTareaId == estadoDeTareaAsignadaId
                        && r.UsuarioId == usuarioId
                        && r.Fecha >= rangoFechaDesde
                        && r.Fecha <= rangoFechaHasta)
                    .Include(r => r.Sucursal)
                        .ThenInclude(s => s.Cliente)
                    .Select(r => new TareaPendiente
                    {
                        TareaId = r.TareaId,
                        RelevamientoId = r.Id,
                        Cliente = r.Sucursal.Cliente.Nombre ?? string.Empty,
                        SucursalId = r.SucursalId,
                        Sucursal = r.Sucursal.Nombre ?? string.Empty,
                        Fecha = r.Fecha,
                        TipoDeTareaId = (int)TipoDeTareaEnum.Relevamiento,
                        TipoDeTarea = TipoDeTareaEnum.Relevamiento.ToString()
                    })
                    .ToListAsync();

                tareas.AddRange(solicitudes);
                tareas.AddRange(relevamientos);

                return Ok(tareas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
