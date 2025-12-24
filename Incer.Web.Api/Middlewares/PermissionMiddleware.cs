using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Incer.Web.Core.Interfaces;
using System.Text.Json;
using System.Security.Claims;

namespace Incer.Web.Api.Middlewares
{
    public class PermissionMiddleware
    {
        private readonly RequestDelegate _next;

        public PermissionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Verificar si la ruta requiere verificación de permisos
            if (ShouldCheckPermissions(context.Request.Path))
            {
                var permissionService = context.RequestServices.GetService<IPermissionService>();
                if (permissionService != null)
                {
                    // Extraer información del usuario del contexto
                    var userId = GetUserIdFromContext(context);
                    var appId = GetAppIdFromContext(context);
                    var centerId = GetCenterIdFromContext(context);

                    Console.WriteLine($"PermissionMiddleware - userId: {userId}, appId: {appId}, centerId: {centerId}");

                    if (userId.HasValue)
                    {
                        // Verificar si el usuario es administrador (tiene permiso global)
                        var isAdmin = await permissionService.CheckPermissionAsync(userId.Value, "*", "*");
                        
                        if (isAdmin)
                        {
                            Console.WriteLine($"PermissionMiddleware - Usuario {userId} es administrador, acceso completo autorizado");
                        }
                        else
                        {
                            // Verificar acceso a la aplicación
                            if (appId.HasValue && !await permissionService.CanAccessAppAsync(userId.Value, appId.Value))
                            {
                                Console.WriteLine($"PermissionMiddleware - Usuario {userId} denegado acceso a app {appId}");
                                context.Response.StatusCode = 403; // Forbidden
                                await context.Response.WriteAsync("Access denied to application");
                                return;
                            }

                            // Verificar acceso al centro si se especifica y es válido (mayor que 0)
                            // Si centerId es 0 o null, no verificar acceso al centro (el usuario puede tener permisos globales)
                            if (centerId.HasValue && centerId.Value > 0 && appId.HasValue)
                            {
                                var canAccessCenter = await permissionService.CanAccessCenterInAppAsync(userId.Value, centerId.Value, appId.Value);
                                if (!canAccessCenter)
                                {
                                    Console.WriteLine($"PermissionMiddleware - Usuario {userId} no tiene acceso al centro {centerId.Value} en app {appId.Value}");
                                    context.Response.StatusCode = 403; // Forbidden
                                    await context.Response.WriteAsync("Access denied to center in application");
                                    return;
                                }
                                Console.WriteLine($"PermissionMiddleware - Usuario {userId} tiene acceso al centro {centerId.Value} en app {appId.Value}");
                            }
                            else if (centerId.HasValue && centerId.Value == 0)
                            {
                                Console.WriteLine($"PermissionMiddleware - centerId es 0, omitiendo verificación de acceso al centro (verificando permisos globales)");
                            }

                            // Verificar permisos específicos para la ruta
                            var resource = GetResourceFromPath(context.Request.Path);
                            var action = GetActionFromMethod(context.Request.Method);
                            
                            if (!string.IsNullOrEmpty(resource) && !string.IsNullOrEmpty(action))
                            {
                                // Si centerId es 0, pasar null para que verifique permisos globales
                                var centerIdForCheck = (centerId.HasValue && centerId.Value > 0) ? centerId : null;
                                
                                Console.WriteLine($"PermissionMiddleware - Verificando permiso {action} en {resource} para usuario {userId}, centerId: {centerIdForCheck}, appId: {appId}");
                                
                                var hasPermission = await permissionService.CheckPermissionAsync(
                                    userId.Value, resource, action, centerIdForCheck, appId);
                                
                                if (!hasPermission)
                                {
                                    Console.WriteLine($"PermissionMiddleware - Usuario {userId} denegado permiso {action} en {resource}");
                                    context.Response.StatusCode = 403; // Forbidden
                                    await context.Response.WriteAsync($"Access denied: {action} permission required for {resource}");
                                    return;
                                }
                                
                                Console.WriteLine($"PermissionMiddleware - Usuario {userId} autorizado para {action} en {resource}");
                            }
                        }

                        Console.WriteLine($"PermissionMiddleware - Usuario {userId} autorizado para {context.Request.Path}");
                    }
                    else
                    {
                        // Si no se puede obtener el userId, denegar acceso
                        Console.WriteLine("PermissionMiddleware - Warning: No se pudo obtener userId, denegando acceso");
                        context.Response.StatusCode = 401; // Unauthorized
                        await context.Response.WriteAsync("Authentication required");
                        return;
                    }
                }
                else
                {
                    Console.WriteLine("PermissionMiddleware - Warning: IPermissionService no disponible");
                    context.Response.StatusCode = 500; // Internal Server Error
                    await context.Response.WriteAsync("Permission service not available");
                    return;
                }
            }

            await _next(context);
        }

        private bool ShouldCheckPermissions(PathString path)
        {
            // Rutas que requieren verificación de permisos
            // Nota: /api/users solo requiere autenticación ([Authorize]) ya que se usa como catálogo
            // en múltiples páginas (RelevamientosPage, SolicitudesPage, etc.)
            var protectedPaths = new[]
            {
                "/api/clients",
                "/api/sucursales",
                "/api/extintores",
                "/api/elementos",
                "/api/puestos",
                "/api/centers",
                // "/api/users", // Removido: se usa como catálogo, solo requiere autenticación
                "/api/roles",
                "/api/permissions",
                "/api/userappaccess",
                "/api/roleappaccess",
                "/api/applications"
            };

            return protectedPaths.Any(protectedPath => path.StartsWithSegments(protectedPath));
        }

        private int? GetUserIdFromContext(HttpContext context)
        {
            // Extraer del token JWT
            var userClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userClaim != null && int.TryParse(userClaim.Value, out var userId))
            {
                return userId;
            }
            return null;
        }

        private int? GetAppIdFromContext(HttpContext context)
        {
            // Extraer del token JWT
            var appClaim = context.User.FindFirst("DefaultApp");
            if (appClaim != null && int.TryParse(appClaim.Value, out var appId))
            {
                return appId;
            }
            return null;
        }

        private int? GetCenterIdFromContext(HttpContext context)
        {
            // Extraer del token JWT
            var centerClaim = context.User.FindFirst("DefaultCenter");
            if (centerClaim != null && int.TryParse(centerClaim.Value, out var centerId))
            {
                // Si el centerId es 0, retornar null (no es un centro válido)
                return centerId > 0 ? centerId : null;
            }
            return null;
        }

        private string GetResourceFromPath(PathString path)
        {
            // Mapear rutas a recursos
            var pathString = path.Value?.ToLower() ?? "";
            
            if (pathString.StartsWith("/api/clients"))
                return "clients";
            if (pathString.StartsWith("/api/sucursales"))
                return "sucursales";
            if (pathString.StartsWith("/api/extintores"))
                return "extintores";
            if (pathString.StartsWith("/api/elementos"))
                return "elementos";
            if (pathString.StartsWith("/api/puestos"))
                return "puestos";
            if (pathString.StartsWith("/api/centers"))
                return "centers";
            if (pathString.StartsWith("/api/users"))
                return "users";
            if (pathString.StartsWith("/api/roles"))
                return "roles";
            if (pathString.StartsWith("/api/permissions"))
                return "permissions";
            if (pathString.StartsWith("/api/userappaccess"))
                return "userappaccess";
            if (pathString.StartsWith("/api/roleappaccess"))
                return "roleappaccess";
            if (pathString.StartsWith("/api/useraccess"))
                return "useraccess";
            
            return "";
        }

        private string GetActionFromMethod(string method)
        {
            return method.ToUpper() switch
            {
                "GET" => "list",
                "POST" => "create",
                "PUT" => "update",
                "PATCH" => "update",
                "DELETE" => "delete",
                _ => ""
            };
        }
    }

    // Extension method para registrar el middleware
    public static class PermissionMiddlewareExtensions
    {
        public static IApplicationBuilder UsePermissionMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<PermissionMiddleware>();
        }
    }
}

