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
    public class EstadosDeRemitoController : ControllerBase
    {
        private readonly IEstadoRemitoRepository _repository;

        public EstadosDeRemitoController(IEstadoRemitoRepository repository)
        {
            _repository = repository;
        }

        // GET: api/EstadosDeRemito
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoRemito>>> GetAllEntities()
        {
            var estadosRemito = await _repository.GetAllAsync();
            return Ok(estadosRemito.OrderBy(item => item.Id));
        }

        // GET: api/EstadosDeRemito/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var estadosRemito = await _repository.GetQueryable()
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();

                return Ok(estadosRemito);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
