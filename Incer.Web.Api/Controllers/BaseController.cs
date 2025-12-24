using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using Incer.Web.Core.Interfaces;
using System.Security.Claims;

namespace Incer.Web.Api.Controllers
{
    public abstract class BaseController : ControllerBase
    {
        protected readonly IPermissionService _permissionService;
        protected readonly IHttpContextAccessor _httpContextAccessor;

        protected BaseController(IPermissionService permissionService, IHttpContextAccessor httpContextAccessor)
        {
            _permissionService = permissionService;
            _httpContextAccessor = httpContextAccessor;
        }

        protected async Task<IQueryable<T>> ApplyCenterFilterAsync<T>(IQueryable<T> query, string centerProperty = "CenterId")
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                Console.WriteLine("ApplyCenterFilterAsync - No hay userId, retornando query sin filtrar");
                return query;
            }

            var appId = GetCurrentAppId();
            Console.WriteLine($"ApplyCenterFilterAsync - userId: {userId.Value}, appId: {appId}");

            // Verificar si tiene acceso global (con el appId correcto)
            var hasGlobalAccess = await _permissionService.CheckPermissionAsync(userId.Value, "*", "*", null, appId);
            if (hasGlobalAccess)
            {
                Console.WriteLine($"ApplyCenterFilterAsync - Usuario {userId.Value} tiene acceso global, no filtrando");
                return query;
            }

            var accessibleCenters = await _permissionService.GetUserAccessibleCentersAsync(userId.Value, appId);
            Console.WriteLine($"ApplyCenterFilterAsync - Centros accesibles: {accessibleCenters.Count()}");
            
            // Si no hay centros accesibles, devolver query vacío
            if (!accessibleCenters.Any())
            {
                Console.WriteLine("ApplyCenterFilterAsync - No hay centros accesibles, retornando query vacío");
                return query.Where(x => false);
            }

            try
            {
                // Crear expresión para propiedades anidadas
                var parameter = Expression.Parameter(typeof(T), "x");
                Expression property = parameter;

                // Manejar propiedades anidadas como "Sucursal.Cliente.BusinessCenterId"
                var propertyParts = centerProperty.Split('.');
                foreach (var part in propertyParts)
                {
                    property = Expression.Property(property, part);
                }

                // Crear expresión Contains
                var centersArray = Expression.Constant(accessibleCenters.ToArray());
                var containsMethod = typeof(Enumerable).GetMethods()
                    .First(m => m.Name == "Contains" && m.GetParameters().Length == 2)
                    .MakeGenericMethod(typeof(int));
                var containsCall = Expression.Call(containsMethod, centersArray, property);
                var lambda = Expression.Lambda<Func<T, bool>>(containsCall, parameter);

                var filteredQuery = query.Where(lambda);
                Console.WriteLine($"ApplyCenterFilterAsync - Filtro aplicado correctamente con {accessibleCenters.Count()} centros");
                return filteredQuery;
            }
            catch (Exception ex)
            {
                // Si hay error en la expresión dinámica, logear y devolver query sin filtrar
                Console.WriteLine($"Error aplicando filtro de centros: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return query;
            }
        }

        protected int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        protected int? GetCurrentAppId()
        {
            var appIdClaim = User.FindFirst("DefaultApp")?.Value;
            return int.TryParse(appIdClaim, out var appId) ? appId : null;
        }

        protected int? GetCurrentCenterId()
        {
            var centerIdClaim = User.FindFirst("DefaultCenter")?.Value;
            return int.TryParse(centerIdClaim, out var centerId) ? centerId : null;
        }
    }
}
