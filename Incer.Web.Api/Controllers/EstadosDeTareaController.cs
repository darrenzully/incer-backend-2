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
    public class EstadosDeTareaController : ControllerBase
    {
        private readonly IEstadoTareaRepository _repository;

        public EstadosDeTareaController(IEstadoTareaRepository repository)
        {
            _repository = repository;
        }

        // GET: api/EstadosDeTarea
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoTarea>>> GetAllEntities()
        {
            var estadosTarea = await _repository.GetAllAsync();
            return Ok(estadosTarea.OrderBy(item => item.Id));
        }

        // GET: api/EstadosDeTarea/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var estadosTarea = await _repository.GetQueryable()
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();
                return Ok(estadosTarea);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
