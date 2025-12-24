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
    public class CapacidadesController : ControllerBase
    {
        private readonly ICapacidadRepository _repository;

        public CapacidadesController(ICapacidadRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Capacidades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Capacidad>>> GetAllEntities()
        {
            var capacidades = await _repository.GetAllAsync();
            return Ok(capacidades.OrderBy(item => item.Id));
        }

        // GET: api/Capacidades/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var capacidades = await _repository.GetQueryable()
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Valor.ToString() })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();

                return Ok(capacidades);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
