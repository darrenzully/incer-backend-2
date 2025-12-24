using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Temporalmente sin autenticación para pruebas
    public class ClientesTestController : ControllerBase
    {
        private readonly IClienteRepository _repository;

        public ClientesTestController(IClienteRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetAll()
        {
            var clientes = await _repository.GetAllForAdminAsync();
            return Ok(clientes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Cliente>> GetById(int id)
        {
            var cliente = await _repository.GetClienteWithDetailsAsync(id);
            if (cliente == null)
                return NotFound();

            return Ok(cliente);
        }
    }
}
