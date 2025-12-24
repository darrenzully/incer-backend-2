using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Incer.Web.Core.Entities;
using Incer.Web.Core.Interfaces;
using Incer.Web.Api.DTOs;
using BCrypt.Net;

namespace Incer.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPermissionService _permissionService;
        private readonly IUserAppAccessRepository _userAppAccessRepository;
        private readonly IUserCenterAppAccessRepository _userCenterAppAccessRepository;

        public AuthController(
            IConfiguration configuration,
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IPermissionService permissionService,
            IUserAppAccessRepository userAppAccessRepository,
            IUserCenterAppAccessRepository userCenterAppAccessRepository)
        {
            _configuration = configuration;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _permissionService = permissionService;
            _userAppAccessRepository = userAppAccessRepository;
            _userCenterAppAccessRepository = userCenterAppAccessRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Username))
                {
                    return BadRequest(new { message = "Usuario requerido" });
                }

                var user = await _userRepository.GetByAliasAsync(request.Username);
                if (user == null || !user.Activo)
                {
                    return Unauthorized(new { message = "Usuario no encontrado o inactivo" });
                }

                if (string.IsNullOrEmpty(request.Password))
                {
                    return Unauthorized(new { message = "Contraseña requerida" });
                }

                // Verificar que el usuario tenga una contraseña configurada
                if (string.IsNullOrEmpty(user.Clave))
                {
                    return Unauthorized(new { message = "El usuario no tiene contraseña configurada. Contacte al administrador." });
                }

                // Verificar contraseña usando BCrypt
                // request.Password es la contraseña en texto plano del request
                // user.Clave es el hash BCrypt almacenado en la base de datos
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Clave))
                {
                    return Unauthorized(new { message = "Contraseña incorrecta" });
                }

                var role = await _roleRepository.GetByIdAsync(user.RoleId);
                if (role == null)
                {
                    return Unauthorized(new { message = "Rol no encontrado" });
                }

                // Obtener aplicaciones accesibles del usuario
                var userApps = await _userAppAccessRepository.GetByUserIdAsync(user.Id);
                var accessibleAppIds = userApps.Where(uaa => uaa.Active).Select(uaa => uaa.AppId).ToList();
                
                // Obtener centros accesibles del usuario
                var userCenters = await _userCenterAppAccessRepository.GetByUserIdAsync(user.Id);
                var accessibleCenterIds = userCenters.Where(uca => uca.Active).Select(uca => uca.BusinessCenterId).Distinct().ToList();

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Alias ?? ""),
                    new Claim(ClaimTypes.Email, user.Mail ?? ""),
                    new Claim(ClaimTypes.Role, role.Name ?? ""),
                    new Claim("UserId", user.Id.ToString()),
                    new Claim("RoleId", user.RoleId.ToString())
                };

                // Solo agregar DefaultApp si hay aplicaciones accesibles
                var defaultAppId = accessibleAppIds.FirstOrDefault();
                if (defaultAppId > 0)
                {
                    claims.Add(new Claim("DefaultApp", defaultAppId.ToString()));
                }

                // Solo agregar DefaultCenter si hay centros accesibles
                var defaultCenterId = accessibleCenterIds.FirstOrDefault();
                if (defaultCenterId > 0)
                {
                    claims.Add(new Claim("DefaultCenter", defaultCenterId.ToString()));
                }

                var token = GenerateJwtToken(claims);
                
                // Crear DTO optimizado del usuario
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Nombre = user.Nombre,
                    Apellido = user.Apellido,
                    Mail = user.Mail,
                    Alias = user.Alias,
                    Foto = user.Foto,
                    RoleId = user.RoleId,
                    Role = new RoleDto
                    {
                        Id = role.Id,
                        Name = role.Name,
                        Description = role.Description
                    },
                    IsActive = user.IsActive
                };
                
                return Ok(new LoginResponse
                {
                    Token = token,
                    User = userDto,
                    AccessibleApps = accessibleAppIds,
                    AccessibleCenters = accessibleCenterIds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [HttpPost("login-with-app")]
        public async Task<IActionResult> LoginWithApp([FromBody] AppLoginRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { message = "Request body no puede ser null" });
                }

                if (string.IsNullOrEmpty(request.Username))
                {
                    return BadRequest(new { message = "Usuario requerido" });
                }

                if (request.AppId <= 0)
                {
                    return BadRequest(new { message = "ID de aplicación requerido" });
                }

                var user = await _userRepository.GetByAliasAsync(request.Username);
                if (user == null || !user.Activo)
                {
                    return Unauthorized(new { message = "Usuario no encontrado o inactivo" });
                }

                if (string.IsNullOrEmpty(request.Password))
                {
                    return Unauthorized(new { message = "Contraseña requerida" });
                }

                // Verificar que el usuario tenga una contraseña configurada
                if (string.IsNullOrEmpty(user.Clave))
                {
                    return Unauthorized(new { message = "El usuario no tiene contraseña configurada. Contacte al administrador." });
                }

                // Verificar contraseña usando BCrypt
                // request.Password es la contraseña en texto plano del request
                // user.Clave es el hash BCrypt almacenado en la base de datos
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Clave))
                {
                    return Unauthorized(new { message = "Contraseña incorrecta" });
                }

                var role = await _roleRepository.GetByIdAsync(user.RoleId);
                if (role == null)
                {
                    return Unauthorized(new { message = "Rol no encontrado" });
                }

                // Verificar si el usuario tiene acceso a la aplicación específica
                var userApps = await _userAppAccessRepository.GetByUserIdAsync(user.Id);
                var hasAppAccess = userApps.Any(uaa => uaa.Active && uaa.AppId == request.AppId);
                
                if (!hasAppAccess)
                {
                    return Unauthorized(new { message = "No tiene permisos para acceder a esta aplicación" });
                }

                // Obtener aplicaciones accesibles del usuario
                var accessibleAppIds = userApps.Where(uaa => uaa.Active).Select(uaa => uaa.AppId).ToList();
                
                // Obtener centros accesibles del usuario para la aplicación específica
                var userCenters = await _userCenterAppAccessRepository.GetByUserIdAsync(user.Id);
                var accessibleCenterIds = userCenters
                    .Where(uca => uca.Active && uca.AppId == request.AppId)
                    .Select(uca => uca.BusinessCenterId)
                    .Distinct()
                    .ToList();

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Alias ?? ""),
                    new Claim(ClaimTypes.Email, user.Mail ?? ""),
                    new Claim(ClaimTypes.Role, role.Name ?? ""),
                    new Claim("UserId", user.Id.ToString()),
                    new Claim("RoleId", user.RoleId.ToString()),
                    new Claim("AppId", request.AppId.ToString()),
                    new Claim("DefaultApp", request.AppId.ToString())
                };

                // Solo agregar DefaultCenter si hay centros accesibles
                var defaultCenterId = accessibleCenterIds.FirstOrDefault();
                if (defaultCenterId > 0)
                {
                    claims.Add(new Claim("DefaultCenter", defaultCenterId.ToString()));
                }

                var token = GenerateJwtToken(claims);
                
                // Crear DTO optimizado del usuario
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Nombre = user.Nombre,
                    Apellido = user.Apellido,
                    Mail = user.Mail,
                    Alias = user.Alias,
                    Foto = user.Foto,
                    RoleId = user.RoleId,
                    Role = new RoleDto
                    {
                        Id = role.Id,
                        Name = role.Name,
                        Description = role.Description
                    },
                    IsActive = user.IsActive
                };
                
                return Ok(new LoginResponse
                {
                    Token = token,
                    User = userDto,
                    AccessibleApps = accessibleAppIds,
                    AccessibleCenters = accessibleCenterIds
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ERROR EN LOGIN WITH APP ===");
                Console.WriteLine($"Tipo: {ex.GetType().Name}");
                Console.WriteLine($"Mensaje: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                    Console.WriteLine($"InnerException StackTrace: {ex.InnerException.StackTrace}");
                }
                Console.WriteLine($"=================================");
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                {
                    return Unauthorized(new { message = "Usuario no válido" });
                }

                var user = await _userRepository.GetByIdWithRoleAsync(id);
                if (user == null || !user.Activo)
                {
                    return Unauthorized(new { message = "Usuario no encontrado o inactivo" });
                }

                // Obtener aplicaciones accesibles del usuario
                var userApps = await _userAppAccessRepository.GetByUserIdAsync(user.Id);
                var accessibleAppIds = userApps.Where(uaa => uaa.Active).Select(uaa => uaa.AppId).ToList();
                
                // Obtener centros accesibles del usuario
                var userCenters = await _userCenterAppAccessRepository.GetByUserIdAsync(user.Id);
                var accessibleCenterIds = userCenters.Where(uca => uca.Active).Select(uca => uca.BusinessCenterId).Distinct().ToList();

                // Crear DTO optimizado del usuario
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Nombre = user.Nombre,
                    Apellido = user.Apellido,
                    Mail = user.Mail,
                    Alias = user.Alias,
                    Foto = user.Foto,
                    RoleId = user.RoleId,
                    Role = user.Role != null ? new RoleDto
                    {
                        Id = user.Role.Id,
                        Name = user.Role.Name,
                        Description = user.Role.Description
                    } : null,
                    IsActive = user.IsActive
                };

                return Ok(new
                {
                    user = userDto,
                    accessibleApps = accessibleAppIds,
                    accessibleCenters = accessibleCenterIds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("refresh")]
        public IActionResult Refresh()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { message = "No autenticado" });

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "clave-secreta-demo");
            var issuer = _configuration["Jwt:Issuer"] ?? "incer-demo";

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, username)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = issuer,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new { token = tokenString });
        }

        private string GenerateJwtToken(List<Claim> claims)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "secret-key-demo");
            var issuer = _configuration["Jwt:Issuer"] ?? "incer-demo";

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = issuer,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
} 