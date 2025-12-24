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
    public class FabricantesController : ControllerBase
    {
        private readonly IFabricanteRepository _repository;

        public FabricantesController(IFabricanteRepository repository)
        {
            _repository = repository;
        }

        // GET: api/Fabricantes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Fabricante>>> GetAllEntities()
        {
            var fabricantes = await _repository.GetAllAsync();
            return Ok(fabricantes.OrderBy(item => item.Id));
        }

        // GET: api/Fabricantes/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var fabricantes = await _repository.GetQueryable()
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();

                return Ok(fabricantes);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
