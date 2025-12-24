using Microsoft.AspNetCore.Mvc.Filters;
using System.Text;
using Serilog;

namespace Incer.Web.Api.Filters
{
    public class LogRequestBodyFilter : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.HttpContext.Request.Method == "POST" || context.HttpContext.Request.Method == "PUT")
            {
                Log.Information("\n\n{Separator}", new string('=', 80));
                Log.Information("=== ACTION FILTER - BEFORE ACTION ===");
                Log.Information("Timestamp: {Timestamp}", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                Log.Information("Controller: {Controller}", context.RouteData.Values["controller"]);
                Log.Information("Action: {Action}", context.RouteData.Values["action"]);
                Log.Information("Path: {Path}", context.HttpContext.Request.Path);
                Log.Information("Content-Type: {ContentType}", context.HttpContext.Request.ContentType);
                Log.Information("Content-Length: {ContentLength}", context.HttpContext.Request.ContentLength);

                // Leer el body
                try
                {
                    context.HttpContext.Request.EnableBuffering();
                    context.HttpContext.Request.Body.Position = 0;
                    using (var reader = new StreamReader(context.HttpContext.Request.Body, Encoding.UTF8, leaveOpen: true))
                    {
                        var body = await reader.ReadToEndAsync();
                        Log.Information("Body raw: {Body}", body);
                    }
                    context.HttpContext.Request.Body.Position = 0;
                }
                catch (Exception ex)
                {
                    Log.Error(ex, "ERROR leyendo body");
                }

                // Log de los argumentos del action
                Log.Information("Action Arguments Count: {Count}", context.ActionArguments.Count);
                foreach (var arg in context.ActionArguments)
                {
                    var valueStr = arg.Value?.ToString() ?? "null";
                    if (valueStr.Length > 200)
                        valueStr = valueStr.Substring(0, 200) + "...";
                    Log.Information("  - {Key}: {Type} = {Value}", arg.Key, arg.Value?.GetType().Name ?? "null", valueStr);
                }

                // Log del ModelState
                Log.Information("ModelState IsValid: {IsValid}", context.ModelState.IsValid);
                if (!context.ModelState.IsValid)
                {
                    Log.Warning("ModelState Errors:");
                    foreach (var error in context.ModelState)
                    {
                        Log.Warning("  - Key: {Key}", error.Key);
                        foreach (var errorMessage in error.Value.Errors)
                        {
                            Log.Warning("    Error: {ErrorMessage}", errorMessage.ErrorMessage);
                            if (errorMessage.Exception != null)
                            {
                                Log.Error(errorMessage.Exception, "    Exception en ModelState");
                            }
                        }
                    }
                }
                Log.Information("{Separator}\n", new string('=', 80));
            }

            var resultContext = await next();
            
            if (context.HttpContext.Request.Method == "POST" || context.HttpContext.Request.Method == "PUT")
            {
                Log.Information("\n=== ACTION FILTER - AFTER ACTION ===");
                Log.Information("Response Status Code: {StatusCode}", context.HttpContext.Response.StatusCode);
                Log.Information("=====================================\n\n");
            }
        }
    }
}

