using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using Incer.Web.Core.Enums;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckListsController : BaseController
    {
        private readonly ICheckListRepository _checkListRepository;
        private readonly ICheckListDetalleRepository _checkListDetalleRepository;
        private readonly ITipoProductoRepository _tipoProductoRepository;
        private readonly ITipoElementoRepository _tipoElementoRepository;
        private readonly ISucursalRepository _sucursalRepository;
        private readonly ITipoDatoRepository _tipoDatoRepository;

        public CheckListsController(
            ICheckListRepository checkListRepository,
            ICheckListDetalleRepository checkListDetalleRepository,
            ITipoProductoRepository tipoProductoRepository,
            ITipoElementoRepository tipoElementoRepository,
            ISucursalRepository sucursalRepository,
            ITipoDatoRepository tipoDatoRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _checkListRepository = checkListRepository;
            _checkListDetalleRepository = checkListDetalleRepository;
            _tipoProductoRepository = tipoProductoRepository;
            _tipoElementoRepository = tipoElementoRepository;
            _sucursalRepository = sucursalRepository;
            _tipoDatoRepository = tipoDatoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CheckList>>> GetAll()
        {
            var checkLists = await _checkListRepository.GetCheckListsWithDetailsAsync();
            return Ok(checkLists);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CheckList>> GetById(int id)
        {
            var checkList = await _checkListRepository.GetCheckListWithDetailsAsync(id);
            if (checkList == null) return NotFound();
            return Ok(checkList);
        }

        [HttpGet("{id}/detalles")]
        public async Task<ActionResult<IEnumerable<CheckListDetalle>>> GetDetalles(int id)
        {
            var detalles = await _checkListDetalleRepository.GetDetallesWithTipoDatoAsync(id);
            return Ok(detalles);
        }

        [HttpGet("tipo-producto/{tipoProductoId}")]
        public async Task<ActionResult<IEnumerable<CheckList>>> GetByTipoDeProducto(int tipoProductoId)
        {
            var checkLists = await _checkListRepository.GetQueryable()
                .Where(cl => cl.TipoDeProductoId == tipoProductoId)
                .ToListAsync();
            return Ok(checkLists);
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<CheckList>>> GetBySucursal(int sucursalId)
        {
            var checkLists = await _checkListRepository.GetCheckListsBySucursalAsync(sucursalId);
            return Ok(checkLists);
        }

        [HttpGet("por-defecto")]
        public async Task<ActionResult<IEnumerable<CheckList>>> GetPorDefecto()
        {
            var checkLists = await _checkListRepository.GetCheckListsPorDefectoAsync();
            return Ok(checkLists);
        }

        [HttpPost]
        public async Task<ActionResult<CheckList>> Create(CheckList checkList)
        {
            // Si es por defecto, limpiar ClienteId y SucursalId
            if (checkList.PorDefecto)
            {
                checkList.ClienteId = null;
                checkList.SucursalId = null;
            }

            // Validar que no exista un checklist activo con la misma configuración
            var exists = await _checkListRepository.ExistsActiveCheckListAsync(
                checkList.TipoDeProductoId, 
                checkList.TipoDeElementoId,
                checkList.ClienteId, 
                checkList.SucursalId);

            if (exists)
            {
                return BadRequest(new { message = "Ya existe un checklist activo con esta configuración" });
            }

            // Establecer versión inicial
            checkList.Version = 1;

            await _checkListRepository.AddAsync(checkList);
            return CreatedAtAction(nameof(GetById), new { id = checkList.Id }, checkList);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CheckList checkList)
        {
            if (id != checkList.Id) return BadRequest();

            // Obtener el checklist existente para preservar la versión actual
            var existingCheckList = await _checkListRepository.GetByIdAsync(id);
            if (existingCheckList == null) return NotFound();

            // Si es por defecto, limpiar ClienteId y SucursalId
            if (checkList.PorDefecto)
            {
                checkList.ClienteId = null;
                checkList.SucursalId = null;
            }

            // Validar que no exista otro checklist activo con la misma configuración
            var exists = await _checkListRepository.ExistsActiveCheckListAsync(
                checkList.TipoDeProductoId, 
                checkList.TipoDeElementoId,
                checkList.ClienteId, 
                checkList.SucursalId, 
                id);

            if (exists)
            {
                return BadRequest(new { message = "Ya existe otro checklist activo con esta configuración" });
            }

            // Incrementar versión al editar
            checkList.Version = existingCheckList.Version + 1;

            await _checkListRepository.UpdateAsync(checkList);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var checkList = await _checkListRepository.GetByIdAsync(id);
            if (checkList == null) return NotFound();

            // En lugar de eliminar físicamente, desactivar
            checkList.Activo = false;
            checkList.FechaUpdate = DateTime.UtcNow;
            await _checkListRepository.UpdateAsync(checkList);
            
            return Ok(new { message = "CheckList desactivado correctamente" });
        }

        [HttpPut("{id}/reactivar")]
        public async Task<IActionResult> Reactivar(int id)
        {
            var checkList = await _checkListRepository.GetByIdAsync(id);
            if (checkList == null) return NotFound();

            checkList.Activo = true;
            checkList.FechaUpdate = DateTime.UtcNow;
            await _checkListRepository.UpdateAsync(checkList);
            
            return Ok(new { message = "CheckList reactivado correctamente" });
        }

        // Endpoints para obtener datos relacionados
        [HttpGet("tipos-producto")]
        public async Task<ActionResult<IEnumerable<TipoDeProducto>>> GetTiposProducto()
        {
            var tipos = await _tipoProductoRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("tipos-elemento")]
        public async Task<ActionResult<IEnumerable<TipoDeElemento>>> GetTiposElemento()
        {
            var tipos = await _tipoElementoRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("sucursales")]
        public async Task<ActionResult<IEnumerable<Sucursal>>> GetSucursales()
        {
            var sucursales = await _sucursalRepository.GetAllAsync();
            return Ok(sucursales);
        }

        [HttpGet("tipos-dato")]
        public async Task<ActionResult<IEnumerable<TipoDeDato>>> GetTiposDato()
        {
            var tipos = await _tipoDatoRepository.GetAllAsync();
            return Ok(tipos);
        }

        [HttpGet("{tipoDeProductoId}/{tipoDeElementoId}/{sucursalId}")]
        public async Task<ActionResult<CheckList>> GetCheckListActivo(int tipoDeProductoId, int? tipoDeElementoId, int sucursalId)
        {
            try
            {
                var checkList = await GetCheckListIdActivoAsync(tipoDeProductoId, tipoDeElementoId, sucursalId);

                if (checkList != null)
                {
                    // Obtener los detalles del checklist
                    var detalles = await _checkListDetalleRepository.GetDetallesWithTipoDatoAsync(checkList.Id);
                    checkList.Detalles = detalles.ToList();
                    
                    // Limpiar la referencia circular
                    checkList.Detalles.ForEach(x => x.CheckList = null);
                    
                    return Ok(checkList);
                }

                return Ok(checkList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        private async Task<CheckList?> GetCheckListIdActivoAsync(int tipoDeProductoId, int? tipoDeElementoId, int sucursalId)
        {
            var query = _checkListRepository.GetQueryable()
                .Where(x => x.Activo && x.TipoDeProductoId == tipoDeProductoId);

            // Si es Instalaciones Fijas, filtrar por TipoDeElementoId
            if (tipoDeProductoId == (int)Incer.Web.Core.Enums.TipoDeProductoEnum.InstalacionesFijas)
            {
                query = query.Where(x => x.TipoDeElementoId == tipoDeElementoId);
            }

            var checkLists = await query.ToListAsync();

            // Priorizar checklist específico de la sucursal, si no existe usar el por defecto
            var checkList = checkLists.Any(x => x.SucursalId == sucursalId)
                ? checkLists.FirstOrDefault(x => x.SucursalId == sucursalId)
                : checkLists.FirstOrDefault(x => x.PorDefecto);

            return checkList;
        }
    }
}
