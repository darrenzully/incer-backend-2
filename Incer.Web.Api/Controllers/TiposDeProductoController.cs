using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Incer.Web.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TiposDeProductoController : ControllerBase
    {
        private readonly ITipoProductoRepository _repository;

        public TiposDeProductoController(ITipoProductoRepository repository)
        {
            _repository = repository;
        }

        // GET: api/TiposDeProducto
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeProducto>>> GetAllEntities()
        {
            var tiposDeProducto = await _repository.GetAllAsync();
            return Ok(tiposDeProducto.OrderBy(x => x.Nombre));
        }

        // GET: api/TiposDeProducto/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList([FromQuery] bool checklist = false)
        {
            try
            {
                IEnumerable<TipoDeProducto> tiposDeProducto;

                if (checklist)
                    tiposDeProducto = await _repository.GetQueryable()
                        .Where(x => !x.Nombre.ToUpper().Contains("PUESTOS"))
                        .ToListAsync();
                else
                    tiposDeProducto = await _repository.GetAllAsync();

                var result = tiposDeProducto
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToList();

                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // GET: api/TiposDeProducto/{id}
        [HttpGet("{id}")]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        [ProducesResponseType(200)]
        public async Task<ActionResult<TipoDeProducto>> GetEntity(int id)
        {
            var tipoProducto = await _repository.GetByIdAsync(id);

            if (tipoProducto == null)
            {
                return NotFound();
            }

            return Ok(tipoProducto);
        }
    }
}
