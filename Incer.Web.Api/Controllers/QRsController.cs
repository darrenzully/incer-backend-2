using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Incer.Web.Api.DTOs;
using Incer.Web.Infrastructure.Data;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Enums;
using Incer.Web.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QRsController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public QRsController(ApplicationDbContext context, IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
            : base(permissionService, httpContextAccessor)
        {
            _context = context;
        }

        [HttpGet("productos")] 
        public async Task<ActionResult<IEnumerable<QrProducto>>> GetQrProductos([FromQuery] int? centerId = null)
        {
            try
            {
                Console.WriteLine($"=== GET QR PRODUCTOS ===");
                Console.WriteLine($"CenterId recibido: {centerId}");
                Console.WriteLine($"CenterId tipo: {centerId?.GetType()}");
                
                // Verificar si hay parámetros en la query string
                var queryString = Request.QueryString.ToString();
                Console.WriteLine($"Query string completa: {queryString}");
                
                // Si no se especifica centerId, obtener el centro actual del usuario
                if (!centerId.HasValue)
                {
                    var userId = GetCurrentUserId();
                    Console.WriteLine($"UserId actual: {userId}");
                    var accessibleCenters = await _permissionService.GetUserAccessibleCentersAsync(userId.Value);
                    Console.WriteLine($"Centros accesibles: {string.Join(", ", accessibleCenters)}");
                    
                    // Si tiene acceso global, no filtrar
                    if (await _permissionService.CheckPermissionAsync(userId.Value, "*", "*"))
                    {
                        Console.WriteLine("Usuario tiene acceso global - no filtrando");
                    }
                    else if (accessibleCenters.Any())
                    {
                        centerId = accessibleCenters.First(); // Usar el primer centro accesible
                        Console.WriteLine($"Usando primer centro accesible: {centerId}");
                    }
                    else
                    {
                        Console.WriteLine("No hay centros accesibles - devolviendo lista vacía");
                        return Ok(new List<QrProducto>());
                    }
                }
                
                var result = new List<QrProducto>();

                // Filtrar extintores por centro
                IQueryable<Extintor> extintoresQuery = _context.Extintores
                    .Where(x => x.Codigo != null && x.Codigo != "")
                    .Include(x => x.Sucursal)!.ThenInclude(s => s.Cliente);

                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando extintores por centro específico: {centerId}");
                    extintoresQuery = extintoresQuery.Where(x => x.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }

                var extintores = await extintoresQuery.ToListAsync();
                Console.WriteLine($"Extintores encontrados después del filtro: {extintores.Count}");
                
                foreach (var ext in extintores)
                {
                    Console.WriteLine($"Extintor ID: {ext.Id}, Cliente: {ext.Sucursal?.Cliente?.Nombre}, Centro: {ext.Sucursal?.Cliente?.BusinessCenterId}");
                    result.Add(new QrProducto
                    {
                        Id = ext.QRId ?? 0,
                        ProductoId = ext.Id,
                        Codigo = ext.Codigo ?? string.Empty,
                        Cliente = ext.Sucursal?.Cliente?.Nombre ?? string.Empty,
                        Sucursal = ext.Sucursal?.Nombre ?? string.Empty,
                        TipoProducto = TipoDeProductoEnum.Extintores.ToString(),
                        Producto = ext.NroSerie ?? string.Empty
                    });
                }

                // Filtrar puestos por centro
                IQueryable<Puesto> puestosQuery = _context.Puestos
                    .Where(x => x.Codigo != null && x.Codigo != "")
                    .Include(x => x.Sucursal)!.ThenInclude(s => s.Cliente);

                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando puestos por centro específico: {centerId}");
                    puestosQuery = puestosQuery.Where(x => x.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }

                var puestos = await puestosQuery.ToListAsync();
                Console.WriteLine($"Puestos encontrados después del filtro: {puestos.Count}");

                foreach (var p in puestos)
                {
                    Console.WriteLine($"Puesto ID: {p.Id}, Cliente: {p.Sucursal?.Cliente?.Nombre}, Centro: {p.Sucursal?.Cliente?.BusinessCenterId}");
                    result.Add(new QrProducto
                    {
                        Id = 0,
                        ProductoId = p.Id,
                        Codigo = p.Codigo ?? string.Empty,
                        Cliente = p.Sucursal?.Cliente?.Nombre ?? string.Empty,
                        Sucursal = p.Sucursal?.Nombre ?? string.Empty,
                        TipoProducto = TipoDeProductoEnum.Puestos.ToString(),
                        Producto = $"{p.Nombre} - {p.Ubicacion}"
                    });
                }

                // Filtrar elementos por centro
                IQueryable<Elemento> elementosQuery = _context.Elementos
                    .Where(x => x.Codigo != null && x.Codigo != "")
                    .Include(x => x.Sucursal)!.ThenInclude(s => s.Cliente)
                    .Include(x => x.TipoDeElemento);

                if (centerId.HasValue)
                {
                    Console.WriteLine($"Filtrando elementos por centro específico: {centerId}");
                    elementosQuery = elementosQuery.Where(x => x.Sucursal.Cliente.BusinessCenterId == centerId.Value);
                }

                var elementos = await elementosQuery.ToListAsync();
                Console.WriteLine($"Elementos encontrados después del filtro: {elementos.Count}");

                foreach (var e in elementos)
                {
                    Console.WriteLine($"Elemento ID: {e.Id}, Cliente: {e.Sucursal?.Cliente?.Nombre}, Centro: {e.Sucursal?.Cliente?.BusinessCenterId}");
                    result.Add(new QrProducto
                    {
                        Id = 0,
                        ProductoId = e.Id,
                        Codigo = e.Codigo ?? string.Empty,
                        Cliente = e.Sucursal?.Cliente?.Nombre ?? string.Empty,
                        Sucursal = e.Sucursal?.Nombre ?? string.Empty,
                        TipoProducto = TipoDeProductoEnum.InstalacionesFijas.ToString(),
                        TipoElemento = e.TipoDeElemento?.Nombre,
                        Producto = $"{e.Interno} - {e.Ubicacion}"
                    });
                }

                Console.WriteLine($"QR productos encontrados: {result.Count}");
                Console.WriteLine($"========================");

                return Ok(result.OrderBy(x => x.Codigo));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en GetQrProductos: {ex.Message}");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<QR>>> GetAll()
        {
            return Ok(await _context.QRs.OrderBy(x => x.Id).ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<QR>> GetById(int id)
        {
            var qr = await _context.QRs.FindAsync(id);
            if (qr == null) return NotFound();
            return Ok(qr);
        }

        [HttpPost]
        public async Task<ActionResult> Create(QR entity)
        {
            _context.QRs.Add(entity);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("generateCodes")]
        public async Task<ActionResult> GenerateCodes()
        {
            // Genera códigos para productos sin código
            // Extintores
            var extintores = await _context.Extintores
                .Include(e => e.Sucursal)!.ThenInclude(s => s.Cliente)
                .Include(e => e.TipoDeCarga)
                .Where(e => string.IsNullOrEmpty(e.Codigo))
                .ToListAsync();

            foreach (var e in extintores)
            {
                var tipo = ((int)TipoDeProductoEnum.Extintores).ToString();
                var tipoCarga = e.TipoDeCarga?.Nombre ?? "";
                e.Codigo = $"{tipo}-{e.Id}-{(e.ClienteId ?? 0)}-{(e.SucursalId ?? 0)}-{(e.NroSerie ?? e.Id.ToString())}-{tipoCarga}";
                _context.Extintores.Update(e);
            }

            // Puestos
            var puestos = await _context.Puestos
                .Include(p => p.Sucursal)!.ThenInclude(s => s.Cliente)
                .Where(p => string.IsNullOrEmpty(p.Codigo))
                .ToListAsync();

            foreach (var p in puestos)
            {
                var tipo = ((int)TipoDeProductoEnum.Puestos).ToString();
                p.Codigo = $"{tipo}-{p.Id}-{p.Sucursal?.Cliente?.Id ?? 0}-{p.SucursalId}-{(p.Nombre ?? p.Id.ToString())}";
                _context.Puestos.Update(p);
            }

            // Elementos (Instalaciones fijas)
            var elementos = await _context.Elementos
                .Include(el => el.Sucursal)!.ThenInclude(s => s.Cliente)
                .Where(el => string.IsNullOrEmpty(el.Codigo))
                .ToListAsync();

            foreach (var el in elementos)
            {
                var tipo = ((int)TipoDeProductoEnum.InstalacionesFijas).ToString();
                el.Codigo = $"{tipo}-{el.Id}-{el.Sucursal?.Cliente?.Id ?? 0}-{el.SucursalId}-{el.Id}";
                _context.Elementos.Update(el);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}


