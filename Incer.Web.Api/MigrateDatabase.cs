using Microsoft.EntityFrameworkCore;
using Incer.Web.Infrastructure.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace Incer.Web.Api
{
    public class MigrateDatabase
    {
        public static async Task RunAsync(string[] args)
        {
            var host = Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((context, config) =>
                {
                    config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
                    config.AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true);
                    config.AddEnvironmentVariables();
                })
                .ConfigureServices((context, services) =>
                {
                    var connectionString = context.Configuration.GetConnectionString("DefaultConnection");
                    services.AddDbContext<ApplicationDbContext>(options =>
                        options.UseNpgsql(connectionString));
                })
                .Build();

            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var context = services.GetRequiredService<ApplicationDbContext>();
                var configuration = services.GetRequiredService<IConfiguration>();

                try
                {
                    Console.WriteLine("Aplicando migraciones...");
                    await context.Database.MigrateAsync();
                    Console.WriteLine("Migraciones aplicadas correctamente.");

                    Console.WriteLine("Ejecutando seed de datos...");
                    context.SeedData();
                    Console.WriteLine("Seed de datos completado.");

                    Console.WriteLine("Ejecutando script reset_sequences.sql...");
                    var connectionString = configuration.GetConnectionString("DefaultConnection");
                    if (string.IsNullOrEmpty(connectionString))
                    {
                        throw new InvalidOperationException("Connection string 'DefaultConnection' no está configurada.");
                    }
                    await ExecuteResetSequencesScript(connectionString);
                    Console.WriteLine("Script reset_sequences.sql ejecutado correctamente.");

                    Console.WriteLine("Proceso completado exitosamente.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error durante la migración: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    Environment.Exit(1);
                }
            }
        }

        private static async Task ExecuteResetSequencesScript(string connectionString)
        {
            // Buscar el script en varias ubicaciones posibles
            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "scripts", "reset_sequences.sql"),
                Path.Combine(AppContext.BaseDirectory, "reset_sequences.sql"),
                Path.Combine(Directory.GetCurrentDirectory(), "scripts", "reset_sequences.sql"),
                Path.Combine(Directory.GetCurrentDirectory(), "reset_sequences.sql"),
                "/app/scripts/reset_sequences.sql",
                "/app/reset_sequences.sql"
            };

            string? scriptPath = null;
            foreach (var path in possiblePaths)
            {
                if (File.Exists(path))
                {
                    scriptPath = path;
                    break;
                }
            }

            if (scriptPath == null)
            {
                throw new FileNotFoundException($"No se encontró el archivo reset_sequences.sql. Buscado en: {string.Join(", ", possiblePaths)}");
            }

            Console.WriteLine($"Ejecutando script desde: {scriptPath}");

            var scriptContent = await File.ReadAllTextAsync(scriptPath);

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();

            await using var command = new NpgsqlCommand(scriptContent, connection);
            await command.ExecuteNonQueryAsync();
        }
    }
}

