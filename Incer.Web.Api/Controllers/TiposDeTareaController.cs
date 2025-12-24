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
    public class TiposDeTareaController : ControllerBase
    {
        private readonly ITipoTareaRepository _repository;

        public TiposDeTareaController(ITipoTareaRepository repository)
        {
            _repository = repository;
        }

        // GET: api/TiposDeTarea
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoTarea>>> GetAllEntities()
        {
            var tiposTarea = await _repository.GetAllAsync();
            return Ok(tiposTarea.OrderBy(item => item.Id));
        }

        // GET: api/TiposDeTarea/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var tiposTarea = await _repository.GetQueryable()
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();
                return Ok(tiposTarea);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
