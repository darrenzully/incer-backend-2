using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Incer.Web.Api.DTOs;
using Microsoft.EntityFrameworkCore;
using System;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TiposDeElementoController : ControllerBase
    {
        private readonly ITipoElementoRepository _repository;
        private readonly ITipoDatoRepository _tipoDatoRepository;

        public TiposDeElementoController(ITipoElementoRepository repository, ITipoDatoRepository tipoDatoRepository)
        {
            _repository = repository;
            _tipoDatoRepository = tipoDatoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDeElemento>>> GetAll()
        {
            var tiposElemento = await _repository.GetAllAsync();
            return Ok(tiposElemento);
        }

        [HttpGet("with-details")]
        public async Task<ActionResult<IEnumerable<TipoDeElemento>>> GetAllWithDetails()
        {
            var tiposElemento = await _repository.GetAllWithDetailsAsync();
            return Ok(tiposElemento);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            var tipoElemento = await _repository.GetByIdWithDetailsAsync(id);
            if (tipoElemento == null) return NotFound();
            
            // Crear un objeto anónimo para evitar ciclos infinitos en la serialización
            var tipoElementoResponse = new
            {
                tipoElemento.Id,
                tipoElemento.Nombre,
                tipoElemento.Activo,
                tipoElemento.FechaCreacion,
                tipoElemento.FechaUpdate,
                tipoElemento.UsuarioCreacion,
                tipoElemento.UsuarioUpdate,
                Detalles = tipoElemento.Detalles?.Select(d => new
                {
                    d.Id,
                    d.Item,
                    d.TipoDatoId,
                    d.TipoElementoId,
                    d.Activo,
                    TipoDeDatoNombre = d.TipoDeDato?.Nombre ?? "N/A"
                }).ToList()
            };
            
            return Ok(tipoElementoResponse);
        }

        [HttpPost]
        public async Task<ActionResult<TipoDeElemento>> Create(TipoDeElemento tipoElemento)
        {
            await _repository.AddAsync(tipoElemento);
            return CreatedAtAction(nameof(GetById), new { id = tipoElemento.Id }, tipoElemento);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, TipoDeElemento tipoElemento)
        {
            if (id != tipoElemento.Id) return BadRequest();
            await _repository.UpdateAsync(tipoElemento);
            return NoContent();
        }

        [HttpGet("{id}/detalles")]
        public async Task<ActionResult<IEnumerable<object>>> Details(int id)
        {
            var result = await _repository.GetQueryable()
                .Where(te => te.Id == id)
                .SelectMany(te => te.Detalles)
                .Include(d => d.TipoDeDato)
                .OrderBy(d => d.Id)
                .Select(d => new
                {
                    id = d.Id,
                    item = d.Item,
                    tipoDeDatoId = d.TipoDatoId,
                    tipoDeDato = d.TipoDeDato != null ? new
                    {
                        id = d.TipoDeDato.Id,
                        nombre = d.TipoDeDato.Nombre
                    } : null,
                    tipoDeElementoId = d.TipoElementoId,
                    tipoDeElemento = (object)null
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<TipoDeElemento>> Delete(int id)
        {
            var tipoElemento = await _repository.GetByIdWithDetailsAsync(id);
            if (tipoElemento == null) return NotFound();

            // Elimina los detalles del TipoElemento primero
            if (tipoElemento.Detalles != null && tipoElemento.Detalles.Any())
            {
                // Los detalles se eliminarán automáticamente por la configuración de cascada en el DbContext
                // o podemos usar el repositorio de detalles si está disponible
            }

            await _repository.DeleteAsync(tipoElemento);
            return Ok(tipoElemento);
        }

        [HttpGet("tipos-dato")]
        public async Task<ActionResult<IEnumerable<TipoDeDato>>> GetTiposDato()
        {
            var tiposDato = await _tipoDatoRepository.GetAllAsync();
            return Ok(tiposDato);
        }

        [HttpGet("combolist")]
        public async Task<ActionResult<IEnumerable<ComboList>>> GetComboList()
        {
            try
            {
                var tiposElemento = await _repository.GetQueryable()
                    .Where(te => te.Activo)
                    .Select(te => new ComboList
                    {
                        Id = te.Id,
                        Nombre = te.Nombre
                    })
                    .OrderBy(te => te.Nombre)
                    .ToListAsync();

                return Ok(tiposElemento);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }
    }
}
