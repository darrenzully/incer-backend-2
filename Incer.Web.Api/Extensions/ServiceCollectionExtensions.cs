using Microsoft.Extensions.DependencyInjection;
using Incer.Web.Core.Interfaces;
using Incer.Web.Infrastructure.Repositories;
using Incer.Web.Infrastructure.UnitOfWork;
using Incer.Web.Infrastructure.Data;
using Incer.Web.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Incer.Web.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Register application services here
            return services;
        }

        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register Entity Framework
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            
            // Register infrastructure services here
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IBusinessCenterRepository, BusinessCenterRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IClienteRepository, ClienteRepository>();
            services.AddScoped<ITipoDeClienteRepository, TipoDeClienteRepository>();
            services.AddScoped<ITipoDeServicioRepository, TipoDeServicioRepository>();
            services.AddScoped<ITipoProductoRepository, TipoDeProductoRepository>();

            services.AddScoped<IPeriodicidadRepository, PeriodicidadRepository>();
            services.AddScoped<ISucursalRepository, SucursalRepository>();
            services.AddScoped<ILocalidadRepository, LocalidadRepository>();
            services.AddScoped<IProvinciaRepository, ProvinciaRepository>();
            services.AddScoped<IPaisRepository, PaisRepository>();
            services.AddScoped<ITipoElementoRepository, TipoElementoRepository>();
            services.AddScoped<ITipoDatoRepository, TipoDatoRepository>();
            services.AddScoped<IEstadoRemitoRepository, EstadoRemitoRepository>();
            services.AddScoped<ITipoRemitoRepository, TipoRemitoRepository>();
            
            // Checklist repositories
            services.AddScoped<ICheckListRepository, CheckListRepository>();
            services.AddScoped<ICheckListDetalleRepository, CheckListDetalleRepository>();
            
            // Presupuesto repositories
            services.AddScoped<IPresupuestoRepository, PresupuestoRepository>();
            services.AddScoped<IArchivoRepository, ArchivoRepository>();
            services.AddScoped<IRemitoUsuarioRepository, RemitoUsuarioRepository>();
            services.AddScoped<IRemitoRepository, RemitoRepository>();
            
            // Gestión repositories
            services.AddScoped<ITareaRepository, TareaRepository>();
            services.AddScoped<IRelevamientoRepository, RelevamientoRepository>();
            services.AddScoped<ITipoTareaRepository, TipoTareaRepository>();
            services.AddScoped<IEstadoTareaRepository, EstadoTareaRepository>();
            
            // Órdenes de Trabajo
            services.AddScoped<IOrdenDeTrabajoRepository, OrdenDeTrabajoRepository>();
            services.AddScoped<IPrioridadRepository, PrioridadRepository>();
            
            // Productos
            services.AddScoped<IExtintorRepository, ExtintorRepository>();
            services.AddScoped<IExtintorHistoriaRepository, ExtintorHistoriaRepository>();
            services.AddScoped<IElementoRepository, ElementoRepository>();
            services.AddScoped<IPuestoRepository, PuestoRepository>();
            services.AddScoped<ITipoDeCargaRepository, TipoDeCargaRepository>();
            services.AddScoped<ICapacidadRepository, CapacidadRepository>();
            services.AddScoped<IFabricanteRepository, FabricanteRepository>();
            services.AddScoped<IQRRepository, QRRepository>();
            
            // Nuevos servicios del sistema multi-app
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IPermissionCacheService, PermissionCacheService>();
            services.AddScoped<IAuditService, AuditService>();
            services.AddScoped<IRoleAccessService, RoleAccessService>();
            
            // Nuevos repositorios para accesos de usuarios
            services.AddScoped<IUserAppAccessRepository, UserAppAccessRepository>();
            services.AddScoped<IUserCenterAppAccessRepository, UserCenterAppAccessRepository>();
            services.AddScoped<IUserClientAccessRepository, UserClientAccessRepository>();
            
            // Nuevos repositorios para el Dashboard de Seguridad
            services.AddScoped<IUserPermissionMatrixRepository, UserPermissionMatrixRepository>();
            services.AddScoped<IAppRepository, AppRepository>();
            services.AddScoped<IResourceRepository, ResourceRepository>();
            services.AddScoped<IActionRepository, ActionRepository>();
            
            // Nuevos repositorios para Plantillas de Roles
            services.AddScoped<IRoleTemplateRepository, RoleTemplateRepository>();
            
            // Servicios de caché
            services.AddMemoryCache();
            
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            return services;
        }
    }
} 