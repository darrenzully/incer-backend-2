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
    public class TiposDeCargaController : ControllerBase
    {
        private readonly ITipoDeCargaRepository _repository;

        public TiposDeCargaController(ITipoDeCargaRepository repository)
        {
            _repository = repository;
        }

        // GET: api/TiposDeCarga
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeCarga>>> GetAllEntities()
        {
            var tiposDeCarga = await _repository.GetAllAsync();
            return Ok(tiposDeCarga);
        }

        // GET: api/TiposDeCarga/combolist
        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var tiposDeCarga = await _repository.GetQueryable()
                    .Select(x => new ComboList { Id = x.Id, Nombre = x.Nombre })
                    .OrderBy(x => x.Nombre)
                    .ToListAsync();

                return Ok(tiposDeCarga);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
