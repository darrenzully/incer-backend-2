using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CheckListDetallesController : BaseController
    {
        private readonly ICheckListDetalleRepository _checkListDetalleRepository;

        public CheckListDetallesController(
            ICheckListDetalleRepository checkListDetalleRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _checkListDetalleRepository = checkListDetalleRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CheckListDetalle>>> GetAll()
        {
            var detalles = await _checkListDetalleRepository.GetAllAsync();
            return Ok(detalles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CheckListDetalle>> GetById(int id)
        {
            var detalle = await _checkListDetalleRepository.GetByIdAsync(id);
            if (detalle == null) return NotFound();
            return Ok(detalle);
        }

        [HttpGet("checklist/{checkListId}")]
        public async Task<ActionResult<IEnumerable<CheckListDetalle>>> GetByCheckListId(int checkListId)
        {
            var detalles = await _checkListDetalleRepository.GetDetallesWithTipoDatoAsync(checkListId);
            return Ok(detalles);
        }

        [HttpPost]
        public async Task<ActionResult<CheckListDetalle>> Create(CheckListDetalle detalle)
        {
            await _checkListDetalleRepository.AddAsync(detalle);
            return CreatedAtAction(nameof(GetById), new { id = detalle.Id }, detalle);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CheckListDetalle detalle)
        {
            if (id != detalle.Id) return BadRequest();

            await _checkListDetalleRepository.UpdateAsync(detalle);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var detalle = await _checkListDetalleRepository.GetByIdAsync(id);
            if (detalle == null) return NotFound();

            // En lugar de eliminar físicamente, desactivar
            detalle.Activo = false;
            detalle.FechaUpdate = DateTime.UtcNow;
            await _checkListDetalleRepository.UpdateAsync(detalle);
            
            return Ok(new { message = "Detalle desactivado correctamente" });
        }
    }
}
