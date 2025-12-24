using Microsoft.AspNetCore.Mvc;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize] // Temporalmente deshabilitado para desarrollo
    public class PresupuestosController : ControllerBase
    {
        private readonly IPresupuestoRepository _presupuestoRepository;
        private readonly IArchivoRepository _archivoRepository;

        public PresupuestosController(IPresupuestoRepository presupuestoRepository, IArchivoRepository archivoRepository)
        {
            _presupuestoRepository = presupuestoRepository;
            _archivoRepository = archivoRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Presupuesto>>> GetPresupuestos()
        {
            var presupuestos = await _presupuestoRepository.GetPresupuestosWithDetailsAsync();
            return Ok(presupuestos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Presupuesto>> GetPresupuesto(int id)
        {
            var presupuesto = await _presupuestoRepository.GetPresupuestoWithDetailsAsync(id);
            if (presupuesto == null)
            {
                return NotFound();
            }
            return Ok(presupuesto);
        }

        [HttpPost]
        public async Task<ActionResult<Presupuesto>> CreatePresupuesto(Presupuesto presupuesto)
        {
            // Generar número automáticamente si no se proporciona
            if (string.IsNullOrEmpty(presupuesto.Numero))
            {
                presupuesto.Numero = await _presupuestoRepository.GenerateNextNumeroAsync();
            }

            // Establecer fecha actual si no se proporciona
            if (presupuesto.Fecha == default)
            {
                presupuesto.Fecha = DateTime.Now;
            }

            // Establecer estado inicial
            if (presupuesto.Estado == 0)
            {
                presupuesto.Estado = EstadoPresupuesto.EnProceso;
            }

            await _presupuestoRepository.AddAsync(presupuesto);
            return CreatedAtAction(nameof(GetPresupuesto), new { id = presupuesto.Id }, presupuesto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePresupuesto(int id, Presupuesto presupuesto)
        {
            if (id != presupuesto.Id)
            {
                return BadRequest();
            }

            var existingPresupuesto = await _presupuestoRepository.GetByIdAsync(id);
            if (existingPresupuesto == null)
            {
                return NotFound();
            }

            await _presupuestoRepository.UpdateAsync(presupuesto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePresupuesto(int id)
        {
            var presupuesto = await _presupuestoRepository.GetByIdAsync(id);
            if (presupuesto == null)
            {
                return NotFound();
            }

            await _presupuestoRepository.DeleteAsync(presupuesto);
            return NoContent();
        }

        [HttpGet("sucursal/{sucursalId}")]
        public async Task<ActionResult<IEnumerable<Presupuesto>>> GetPresupuestosBySucursal(int sucursalId)
        {
            var presupuestos = await _presupuestoRepository.GetPresupuestosBySucursalAsync(sucursalId);
            return Ok(presupuestos);
        }

        [HttpGet("estado/{estado}")]
        public async Task<ActionResult<IEnumerable<Presupuesto>>> GetPresupuestosByEstado(EstadoPresupuesto estado)
        {
            var presupuestos = await _presupuestoRepository.GetPresupuestosByEstadoAsync(estado);
            return Ok(presupuestos);
        }

        [HttpGet("generar-numero")]
        public async Task<ActionResult<string>> GenerarNumero()
        {
            var numero = await _presupuestoRepository.GenerateNextNumeroAsync();
            return Ok(new { numero });
        }

        [HttpPost("upload-file")]
        public async Task<ActionResult<Archivo>> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No se ha seleccionado ningún archivo");
            }

            // Validar tamaño del archivo (10MB máximo)
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest("El archivo es demasiado grande. El tamaño máximo es 10MB");
            }

            // Validar tipo de archivo
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Tipo de archivo no permitido. Solo se permiten: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG");
            }

            try
            {
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                var fileBytes = memoryStream.ToArray();

                var archivo = new Archivo
                {
                    Nombre = file.FileName,
                    Fecha = DateTime.Now,
                    Contenido = fileBytes,
                    Activo = true,
                    FechaCreacion = DateTime.Now,
                    UsuarioCreacion = "system" // TODO: Obtener del contexto de usuario
                };

                await _archivoRepository.AddAsync(archivo);
                return Ok(archivo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al subir el archivo: {ex.Message}");
            }
        }

        [HttpGet("download-file/{archivoId}")]
        public async Task<IActionResult> DownloadFile(int archivoId)
        {
            try
            {
                var archivo = await _archivoRepository.GetByIdAsync(archivoId);
                if (archivo == null || !archivo.Activo)
                {
                    return NotFound("Archivo no encontrado");
                }

                if (archivo.Contenido == null || archivo.Contenido.Length == 0)
                {
                    return BadRequest("El archivo no tiene contenido");
                }

                // Determinar el tipo de contenido basado en la extensión del archivo
                var extension = Path.GetExtension(archivo.Nombre).ToLowerInvariant();
                var contentType = extension switch
                {
                    ".pdf" => "application/pdf",
                    ".doc" => "application/msword",
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ".xls" => "application/vnd.ms-excel",
                    ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    _ => "application/octet-stream"
                };

                return File(archivo.Contenido, contentType, archivo.Nombre);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al descargar el archivo: {ex.Message}");
            }
        }
    }
}
