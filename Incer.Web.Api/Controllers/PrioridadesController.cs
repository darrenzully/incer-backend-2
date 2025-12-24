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
    public class PrioridadesController : ControllerBase
    {
        private readonly IPrioridadRepository _repository;

        public PrioridadesController(IPrioridadRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Prioridades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prioridad>>> GetAllEntities()
        {
            var prioridades = await _repository.GetAllAsync();
            return Ok(prioridades.OrderBy(item => item.Id));
        }

        // GET: api/Prioridades/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var prioridades = await _repository.GetQueryable()
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();

                return Ok(prioridades);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
