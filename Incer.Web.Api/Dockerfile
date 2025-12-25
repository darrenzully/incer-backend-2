# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Configurar variables de entorno para optimizar el uso de memoria
ENV DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1
ENV NUGET_XMLDOC_MODE=skip
ENV DOTNET_EnableDiagnostics=0
ENV DOTNET_NOLOGO=1

# Copy solution and project files
COPY ["Incer.Web.Api/Incer.Web.Api.csproj", "Incer.Web.Api/"]
COPY ["Incer.Web.Core/Incer.Web.Core.csproj", "Incer.Web.Core/"]
COPY ["Incer.Web.Infrastructure/Incer.Web.Infrastructure.csproj", "Incer.Web.Infrastructure/"]

# Restore dependencies - restaurar todos los proyectos para asegurar dependencias transitivas
RUN dotnet restore "Incer.Web.Core/Incer.Web.Core.csproj" && \
    dotnet restore "Incer.Web.Infrastructure/Incer.Web.Infrastructure.csproj" && \
    dotnet restore "Incer.Web.Api/Incer.Web.Api.csproj"

# Copy all source code
COPY Incer.Web.Api/ Incer.Web.Api/
COPY Incer.Web.Core/ Incer.Web.Core/
COPY Incer.Web.Infrastructure/ Incer.Web.Infrastructure/

# Build and publish con optimizaciones de memoria
WORKDIR "/src/Incer.Web.Api"
RUN dotnet build "Incer.Web.Api.csproj" -c Release -o /app/build \
    --no-restore \
    -m:1 \
    -p:BuildInParallel=false \
    -p:UseSharedCompilation=false \
    -p:Incremental=false \
    -p:RunAnalyzers=false \
    -p:EnableNETAnalyzers=false \
    -p:AnalysisMode=None \
    -p:DebugType=None \
    -p:DebugSymbols=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy published files
COPY --from=build /app/build .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "Incer.Web.Api.dll"] 