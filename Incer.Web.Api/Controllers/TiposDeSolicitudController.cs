using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Enums;
using Incer.Web.Core.Helpers;
using Incer.Web.Api.DTOs;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TiposDeSolicitudController : ControllerBase
    {
        // GET: api/TiposDeSolicitud
        [HttpGet]
        public ActionResult<IEnumerable<TipoSolicitud>> GetAllEntities()
        {
            try
            {
                var tipos = ((TipoDeSolicitudEnum[])Enum.GetValues(typeof(TipoDeSolicitudEnum)))
                    .Select(c => new TipoSolicitud()
                    { 
                        Id = (int)c, 
                        Nombre = c.GetDescription() 
                    })
                    .ToList();
                
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        // GET: api/TiposDeSolicitud/combolist
        [HttpGet("combolist")]
        public ActionResult<IEnumerable<TipoSolicitud>> GetComboList()
        {
            try
            {
                var tipos = ((TipoDeSolicitudEnum[])Enum.GetValues(typeof(TipoDeSolicitudEnum)))
                    .Select(c => new TipoSolicitud()
                    { 
                        Id = (int)c, 
                        Nombre = c.GetDescription() 
                    })
                    .ToList();
                
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
