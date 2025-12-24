using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Api.DTOs;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TiposDeDatoController : BaseController
    {
        private readonly ITipoDatoRepository _tipoDatoRepository;

        public TiposDeDatoController(
            ITipoDatoRepository tipoDatoRepository,
            IPermissionService permissionService,
            IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _tipoDatoRepository = tipoDatoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeDato>>> GetAll()
        {
            var tiposDato = await _tipoDatoRepository.GetAllAsync();
            return Ok(tiposDato);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDeDato>> GetById(int id)
        {
            var tipoDato = await _tipoDatoRepository.GetByIdAsync(id);
            if (tipoDato == null) return NotFound();
            return Ok(tipoDato);
        }

        [HttpPost]
        public async Task<ActionResult<TipoDeDato>> Create(TipoDeDato tipoDato)
        {
            await _tipoDatoRepository.AddAsync(tipoDato);
            return CreatedAtAction(nameof(GetById), new { id = tipoDato.Id }, tipoDato);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TipoDeDato tipoDato)
        {
            if (id != tipoDato.Id) return BadRequest();
            await _tipoDatoRepository.UpdateAsync(tipoDato);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tipoDato = await _tipoDatoRepository.GetByIdAsync(id);
            if (tipoDato == null) return NotFound();
            await _tipoDatoRepository.DeleteAsync(tipoDato);
            return Ok(new { message = "Tipo de dato desactivado correctamente" });
        }

        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var tiposDato = await _tipoDatoRepository.GetQueryable()
                    .Where(td => td.Activo)
                    .Select(td => new ComboList
                    {
                        Id = td.Id,
                        Nombre = td.Nombre
                    })
                    .OrderBy(td => td.Nombre)
                    .ToListAsync();

                return Ok(tiposDato);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
