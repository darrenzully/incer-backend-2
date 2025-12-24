using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // Temporalmente sin autenticación para pruebas
    public class UsersTestController : ControllerBase
    {
        private readonly IUserRepository _repository;

        public UsersTestController(IUserRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            var users = await _repository.GetAllWithRoleAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            var user = await _repository.GetByIdWithRoleAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<User>> Create(User user)
        {
            await _repository.AddAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, User user)
        {
            if (id != user.Id) return BadRequest();
            await _repository.UpdateAsync(user);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _repository.GetByIdAsync(id);
            if (user == null) return NotFound();
            await _repository.DeleteAsync(user);
            return NoContent();
        }
    }
}
