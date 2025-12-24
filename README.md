# Incer Web v2 - Modernización

Este proyecto contiene la nueva arquitectura basada en Clean Architecture y .NET 9.

## Estructura de carpetas
- **Incer.Web.Core**: Entidades de dominio y lógica de negocio.
- **Incer.Web.Application**: Casos de uso, CQRS, interfaces de aplicación.
- **Incer.Web.Infrastructure**: Implementaciones de acceso a datos, servicios externos, etc.
- **Incer.Web.Api**: API principal y configuración de la aplicación.
- **instruccions**: Plan de migración y documentación.

## Objetivo
Modernizar la aplicación para aprovechar .NET 9 y las mejores prácticas de frontend y backend.

Ver detalles en `instruccions/instruccions.MD`.

---

## Build y Test Local

```bash
dotnet restore webv2/Incer.Web.sln
dotnet build webv2/Incer.Web.sln --configuration Release
dotnet test webv2/Incer.Web.sln
```

## Docker

### Build local de la imagen
```bash
docker build -t incer-web-api:latest -f webv2/Incer.Web.Api/Dockerfile webv2/Incer.Web.Api
```

### Ejecutar localmente
```bash
docker run -p 8080:8080 incer-web-api:latest
```

## CI/CD con GitHub Actions

- El workflow `.github/workflows/dotnet-ci.yml` ejecuta build y test en cada push/pull request.
- El workflow `.github/workflows/docker-build.yml` construye y publica la imagen Docker en DockerHub (requiere secretos configurados).

### Variables necesarias para DockerHub
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

---

¿Dudas o sugerencias? Revisa el plan en `instruccions/instruccions.MD` o contacta al equipo de desarrollo. 