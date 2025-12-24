using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Incer.Web.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Platform = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BusinessCenters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessCenters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Capacidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Capacidades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstadosDeOT",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadosDeOT", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstadosRemito",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadosRemito", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstadoTareas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstadoTareas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Fabricantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fabricantes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Paises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Paises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Periodicidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Periodicidades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Prioridades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prioridades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QRs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QRs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoleTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposDato",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDato", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposDeCliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDeCliente", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposDeServicio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDeServicio", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposElemento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposElemento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposProducto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposProducto", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposRemito",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposRemito", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TipoTareas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoTareas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UnidadesDeMedida",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Simbolo = table.Column<string>(type: "text", nullable: true),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnidadesDeMedida", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Actions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Actions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Actions_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Resources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resources_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Provincias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    PaisId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Provincias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Provincias_Paises_PaisId",
                        column: x => x.PaisId,
                        principalTable: "Paises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Apellido = table.Column<string>(type: "text", nullable: true),
                    Mail = table.Column<string>(type: "text", nullable: true),
                    Alias = table.Column<string>(type: "text", nullable: true),
                    Clave = table.Column<string>(type: "text", nullable: true),
                    Foto = table.Column<byte[]>(type: "bytea", nullable: true),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    RoleId1 = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId1",
                        column: x => x.RoleId1,
                        principalTable: "Roles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TiposElementoDetalle",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TipoElementoId = table.Column<int>(type: "integer", nullable: false),
                    Item = table.Column<string>(type: "text", nullable: false),
                    TipoDatoId = table.Column<int>(type: "integer", nullable: false),
                    Requerido = table.Column<bool>(type: "boolean", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposElementoDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TiposElementoDetalle_TiposDato_TipoDatoId",
                        column: x => x.TipoDatoId,
                        principalTable: "TiposDato",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TiposElementoDetalle_TiposElemento_TipoElementoId",
                        column: x => x.TipoElementoId,
                        principalTable: "TiposElemento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AlcanceDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    TipoDeProductoId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlcanceDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlcanceDetalles_TiposProducto_TipoDeProductoId",
                        column: x => x.TipoDeProductoId,
                        principalTable: "TiposProducto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TiposDeCarga",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    RecargaPh = table.Column<int>(type: "integer", nullable: false),
                    UnidadDeMedidaId = table.Column<int>(type: "integer", nullable: false),
                    Duracion = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposDeCarga", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TiposDeCarga_UnidadesDeMedida_UnidadDeMedidaId",
                        column: x => x.UnidadDeMedidaId,
                        principalTable: "UnidadesDeMedida",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Resource = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Scope = table.Column<string>(type: "text", nullable: false),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    ActionId = table.Column<int>(type: "integer", nullable: true),
                    ResourceId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Permissions_Actions_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Actions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Permissions_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Localidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    ProvinciaId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Localidades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Localidades_Provincias_ProvinciaId",
                        column: x => x.ProvinciaId,
                        principalTable: "Provincias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    Success = table.Column<bool>(type: "boolean", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TipoDeClienteId = table.Column<int>(type: "integer", nullable: false),
                    TipoDeServicioId = table.Column<int>(type: "integer", nullable: false),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    CUIT = table.Column<string>(type: "text", nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    RazonSocial = table.Column<string>(type: "text", nullable: true),
                    VendedorId = table.Column<int>(type: "integer", nullable: false),
                    ArchivoId = table.Column<int>(type: "integer", nullable: true),
                    AlcancesDetallesIds = table.Column<List<int>>(type: "integer[]", nullable: true),
                    BusinessCenterId1 = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Clientes_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Clientes_BusinessCenters_BusinessCenterId1",
                        column: x => x.BusinessCenterId1,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Clientes_TiposDeCliente_TipoDeClienteId",
                        column: x => x.TipoDeClienteId,
                        principalTable: "TiposDeCliente",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Clientes_TiposDeServicio_TipoDeServicioId",
                        column: x => x.TipoDeServicioId,
                        principalTable: "TiposDeServicio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Clientes_Users_VendedorId",
                        column: x => x.VendedorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RemitoUsuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Letra = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: true),
                    Secuencia = table.Column<string>(type: "text", nullable: true),
                    NumeroDesde = table.Column<int>(type: "integer", nullable: false),
                    NumeroHasta = table.Column<int>(type: "integer", nullable: false),
                    ChoferId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RemitoUsuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RemitoUsuarios_Users_ChoferId",
                        column: x => x.ChoferId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoleAppAccesses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    AccessLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GrantedBy = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleAppAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleAppAccesses_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleAppAccesses_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleAppAccesses_Users_GrantedBy",
                        column: x => x.GrantedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoleCenterAccesses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    AccessLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GrantedBy = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleCenterAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleCenterAccesses_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleCenterAccesses_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleCenterAccesses_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleCenterAccesses_Users_GrantedBy",
                        column: x => x.GrantedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAppAccesses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    AccessLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GrantedBy = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    AppId1 = table.Column<int>(type: "integer", nullable: true),
                    UserId1 = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAppAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAppAccesses_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAppAccesses_Applications_AppId1",
                        column: x => x.AppId1,
                        principalTable: "Applications",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserAppAccesses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAppAccesses_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserCenterAppAccesses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    AccessLevel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GrantedBy = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    BusinessCenterId1 = table.Column<int>(type: "integer", nullable: true),
                    UserId1 = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCenterAppAccesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCenterAppAccesses_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCenterAppAccesses_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCenterAppAccesses_BusinessCenters_BusinessCenterId1",
                        column: x => x.BusinessCenterId1,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserCenterAppAccesses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserCenterAppAccesses_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UserPermissionMatrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: false),
                    ResourceId = table.Column<int>(type: "integer", nullable: false),
                    ActionId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissionMatrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPermissionMatrices_Actions_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Actions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissionMatrices_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissionMatrices_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissionMatrices_Resources_ResourceId",
                        column: x => x.ResourceId,
                        principalTable: "Resources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissionMatrices_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppPermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PermissionId = table.Column<int>(type: "integer", nullable: false),
                    AppId = table.Column<int>(type: "integer", nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    AppId1 = table.Column<int>(type: "integer", nullable: true),
                    PermissionId1 = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppPermissions_Applications_AppId",
                        column: x => x.AppId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppPermissions_Applications_AppId1",
                        column: x => x.AppId1,
                        principalTable: "Applications",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppPermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppPermissions_Permissions_PermissionId1",
                        column: x => x.PermissionId1,
                        principalTable: "Permissions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    PermissionId = table.Column<int>(type: "integer", nullable: false),
                    IsGranted = table.Column<bool>(type: "boolean", nullable: false),
                    GrantedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GrantedBy = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Users_GrantedBy",
                        column: x => x.GrantedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoleTemplatePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleTemplateId = table.Column<int>(type: "integer", nullable: false),
                    PermissionId = table.Column<int>(type: "integer", nullable: false),
                    PermissionId1 = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleTemplatePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleTemplatePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleTemplatePermissions_Permissions_PermissionId1",
                        column: x => x.PermissionId1,
                        principalTable: "Permissions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RoleTemplatePermissions_RoleTemplates_RoleTemplateId",
                        column: x => x.RoleTemplateId,
                        principalTable: "RoleTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Archivos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaRecepcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Contenido = table.Column<byte[]>(type: "bytea", nullable: true),
                    ClienteId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Archivos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Archivos_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ClienteAlcanceDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<int>(type: "integer", nullable: false),
                    AlcanceDetalleId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClienteAlcanceDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClienteAlcanceDetalles_AlcanceDetalles_AlcanceDetalleId",
                        column: x => x.AlcanceDetalleId,
                        principalTable: "AlcanceDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClienteAlcanceDetalles_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClienteAlcances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<int>(type: "integer", nullable: false),
                    TipoDeProductoId = table.Column<int>(type: "integer", nullable: false),
                    TipoDeElementoId = table.Column<int>(type: "integer", nullable: true),
                    TipoDeServicioId = table.Column<int>(type: "integer", nullable: true),
                    PeriodicidadId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClienteAlcances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClienteAlcances_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClienteAlcances_Periodicidades_PeriodicidadId",
                        column: x => x.PeriodicidadId,
                        principalTable: "Periodicidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClienteAlcances_TiposDeServicio_TipoDeServicioId",
                        column: x => x.TipoDeServicioId,
                        principalTable: "TiposDeServicio",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClienteAlcances_TiposElemento_TipoDeElementoId",
                        column: x => x.TipoDeElementoId,
                        principalTable: "TiposElemento",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ClienteAlcances_TiposProducto_TipoDeProductoId",
                        column: x => x.TipoDeProductoId,
                        principalTable: "TiposProducto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sucursales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<int>(type: "integer", nullable: false),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: true),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    LocalidadId = table.Column<int>(type: "integer", nullable: false),
                    MapaDePuestos = table.Column<byte[]>(type: "bytea", nullable: true),
                    Mail = table.Column<string>(type: "text", nullable: true),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sucursales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sucursales_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Sucursales_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Sucursales_Localidades_LocalidadId",
                        column: x => x.LocalidadId,
                        principalTable: "Localidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClienteArchivos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<int>(type: "integer", nullable: false),
                    ArchivoId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClienteArchivos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClienteArchivos_Archivos_ArchivoId",
                        column: x => x.ArchivoId,
                        principalTable: "Archivos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClienteArchivos_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CheckLists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PorDefecto = table.Column<bool>(type: "boolean", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    TipoDeProductoId = table.Column<int>(type: "integer", nullable: false),
                    TipoDeElementoId = table.Column<int>(type: "integer", nullable: true),
                    SucursalId = table.Column<int>(type: "integer", nullable: true),
                    ClienteId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckLists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckLists_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CheckLists_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CheckLists_TiposElemento_TipoDeElementoId",
                        column: x => x.TipoDeElementoId,
                        principalTable: "TiposElemento",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CheckLists_TiposProducto_TipoDeProductoId",
                        column: x => x.TipoDeProductoId,
                        principalTable: "TiposProducto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Contactos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TipoDeContacto = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Detalles = table.Column<string>(type: "text", nullable: true),
                    EstadoVisitaTecnica = table.Column<int>(type: "integer", nullable: true),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contactos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Contactos_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Contactos_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Elementos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TipoDeElementoId = table.Column<int>(type: "integer", nullable: false),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    Ubicacion = table.Column<string>(type: "text", nullable: true),
                    Codigo = table.Column<string>(type: "text", nullable: true),
                    QRId = table.Column<int>(type: "integer", nullable: true),
                    Interno = table.Column<int>(type: "integer", nullable: false),
                    UltimoRelevamiento = table.Column<string>(type: "text", nullable: true),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Elementos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Elementos_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Elementos_QRs_QRId",
                        column: x => x.QRId,
                        principalTable: "QRs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Elementos_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Elementos_TiposElemento_TipoDeElementoId",
                        column: x => x.TipoDeElementoId,
                        principalTable: "TiposElemento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Extintores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SucursalId = table.Column<int>(type: "integer", nullable: true),
                    ClienteId = table.Column<int>(type: "integer", nullable: true),
                    TipoDeCargaId = table.Column<int>(type: "integer", nullable: false),
                    CapacidadId = table.Column<int>(type: "integer", nullable: false),
                    VencimientoCarga = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VencimientoPH = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Interno = table.Column<int>(type: "integer", nullable: true),
                    Orden = table.Column<int>(type: "integer", nullable: false),
                    Ubicacion = table.Column<string>(type: "text", nullable: true),
                    Codigo = table.Column<string>(type: "text", nullable: true),
                    NroSerie = table.Column<string>(type: "text", nullable: true),
                    FabricanteId = table.Column<int>(type: "integer", nullable: true),
                    NroFabricante = table.Column<string>(type: "text", nullable: true),
                    Año = table.Column<int>(type: "integer", nullable: true),
                    Incorporacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Etiqueta = table.Column<string>(type: "text", nullable: true),
                    IRAM = table.Column<string>(type: "text", nullable: true),
                    Reserva = table.Column<bool>(type: "boolean", nullable: false),
                    Baja = table.Column<bool>(type: "boolean", nullable: false),
                    ObservacionBaja = table.Column<string>(type: "text", nullable: true),
                    QRId = table.Column<int>(type: "integer", nullable: true),
                    FechaRecepcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Extintores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Extintores_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Extintores_Capacidades_CapacidadId",
                        column: x => x.CapacidadId,
                        principalTable: "Capacidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Extintores_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Extintores_Fabricantes_FabricanteId",
                        column: x => x.FabricanteId,
                        principalTable: "Fabricantes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Extintores_QRs_QRId",
                        column: x => x.QRId,
                        principalTable: "QRs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Extintores_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Extintores_TiposDeCarga_TipoDeCargaId",
                        column: x => x.TipoDeCargaId,
                        principalTable: "TiposDeCarga",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Presupuestos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Numero = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    EstadoStr = table.Column<string>(type: "text", nullable: true),
                    ArchivoId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Presupuestos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Presupuestos_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Presupuestos_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Remitos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RemitoUsuarioId = table.Column<int>(type: "integer", nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaRecepcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Letra = table.Column<string>(type: "text", nullable: true),
                    Secuencia = table.Column<string>(type: "text", nullable: true),
                    Numero = table.Column<int>(type: "integer", nullable: false),
                    EstadoRemitoId = table.Column<int>(type: "integer", nullable: false),
                    ChoferId = table.Column<int>(type: "integer", nullable: false),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    RemitoManualId = table.Column<int>(type: "integer", nullable: true),
                    RemitoOficialId = table.Column<int>(type: "integer", nullable: true),
                    FechaRemitoOficial = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NumeroRemitoOficial = table.Column<int>(type: "integer", nullable: true),
                    FechaFactura = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NumeroFactura = table.Column<int>(type: "integer", nullable: true),
                    NoFacturable = table.Column<bool>(type: "boolean", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    FirmaOperador = table.Column<byte[]>(type: "bytea", nullable: true),
                    FirmaEncargado = table.Column<byte[]>(type: "bytea", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Remitos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Remitos_Archivos_RemitoManualId",
                        column: x => x.RemitoManualId,
                        principalTable: "Archivos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Remitos_Archivos_RemitoOficialId",
                        column: x => x.RemitoOficialId,
                        principalTable: "Archivos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Remitos_EstadosRemito_EstadoRemitoId",
                        column: x => x.EstadoRemitoId,
                        principalTable: "EstadosRemito",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Remitos_RemitoUsuarios_RemitoUsuarioId",
                        column: x => x.RemitoUsuarioId,
                        principalTable: "RemitoUsuarios",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Remitos_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Remitos_Users_ChoferId",
                        column: x => x.ChoferId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CheckListDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Orden = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "text", nullable: true),
                    Item = table.Column<string>(type: "text", nullable: true),
                    Requerido = table.Column<bool>(type: "boolean", nullable: false),
                    CheckListId = table.Column<int>(type: "integer", nullable: false),
                    TipoDeDatoId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheckListDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CheckListDetalles_CheckLists_CheckListId",
                        column: x => x.CheckListId,
                        principalTable: "CheckLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CheckListDetalles_TiposDato_TipoDeDatoId",
                        column: x => x.TipoDeDatoId,
                        principalTable: "TiposDato",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ElementosTipoElementoDetalle",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ElementoId = table.Column<int>(type: "integer", nullable: false),
                    TipoElementoDetalleId = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<string>(type: "text", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElementosTipoElementoDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ElementosTipoElementoDetalle_Elementos_ElementoId",
                        column: x => x.ElementoId,
                        principalTable: "Elementos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ElementosTipoElementoDetalle_TiposElementoDetalle_TipoEleme~",
                        column: x => x.TipoElementoDetalleId,
                        principalTable: "TiposElementoDetalle",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Puestos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    ExtintorId = table.Column<int>(type: "integer", nullable: true),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Ubicacion = table.Column<string>(type: "text", nullable: true),
                    Codigo = table.Column<string>(type: "text", nullable: true),
                    QRId = table.Column<int>(type: "integer", nullable: true),
                    Deshabilitado = table.Column<bool>(type: "boolean", nullable: false),
                    FechaDeshabilitacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UltimoRelevamiento = table.Column<string>(type: "text", nullable: true),
                    BusinessCenterId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Puestos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Puestos_BusinessCenters_BusinessCenterId",
                        column: x => x.BusinessCenterId,
                        principalTable: "BusinessCenters",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Puestos_Extintores_ExtintorId",
                        column: x => x.ExtintorId,
                        principalTable: "Extintores",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Puestos_QRs_QRId",
                        column: x => x.QRId,
                        principalTable: "QRs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Puestos_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ArchivoPresupuesto",
                columns: table => new
                {
                    ArchivosId = table.Column<int>(type: "integer", nullable: false),
                    PresupuestoId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArchivoPresupuesto", x => new { x.ArchivosId, x.PresupuestoId });
                    table.ForeignKey(
                        name: "FK_ArchivoPresupuesto_Archivos_ArchivosId",
                        column: x => x.ArchivosId,
                        principalTable: "Archivos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ArchivoPresupuesto_Presupuestos_PresupuestoId",
                        column: x => x.PresupuestoId,
                        principalTable: "Presupuestos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PresupuestoArchivos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ArchivoId = table.Column<int>(type: "integer", nullable: false),
                    PresupuestoId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PresupuestoArchivos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PresupuestoArchivos_Archivos_ArchivoId",
                        column: x => x.ArchivoId,
                        principalTable: "Archivos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PresupuestoArchivos_Presupuestos_PresupuestoId",
                        column: x => x.PresupuestoId,
                        principalTable: "Presupuestos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrdenesDeTrabajo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    Numero = table.Column<int>(type: "integer", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    PrioridadId = table.Column<int>(type: "integer", nullable: false),
                    EstadoDeOTId = table.Column<int>(type: "integer", nullable: false),
                    FechaIngreso = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaRecepcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaTerminacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaSalida = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaEntrega = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RemitoId = table.Column<int>(type: "integer", nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdenesDeTrabajo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrdenesDeTrabajo_EstadosDeOT_EstadoDeOTId",
                        column: x => x.EstadoDeOTId,
                        principalTable: "EstadosDeOT",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdenesDeTrabajo_Prioridades_PrioridadId",
                        column: x => x.PrioridadId,
                        principalTable: "Prioridades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdenesDeTrabajo_Remitos_RemitoId",
                        column: x => x.RemitoId,
                        principalTable: "Remitos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_OrdenesDeTrabajo_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrdenesDeTrabajo_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PresupuestoRemitos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RemitoId = table.Column<int>(type: "integer", nullable: false),
                    PresupuestoId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PresupuestoRemitos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PresupuestoRemitos_Presupuestos_PresupuestoId",
                        column: x => x.PresupuestoId,
                        principalTable: "Presupuestos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PresupuestoRemitos_Remitos_RemitoId",
                        column: x => x.RemitoId,
                        principalTable: "Remitos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tareas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    PresupuestoId = table.Column<int>(type: "integer", nullable: true),
                    ContactoId = table.Column<int>(type: "integer", nullable: true),
                    TipoDeTareaId = table.Column<int>(type: "integer", nullable: false),
                    TipoSolicitudId = table.Column<int>(type: "integer", nullable: true),
                    PeriodicidadId = table.Column<int>(type: "integer", nullable: true),
                    PrioridadId = table.Column<int>(type: "integer", nullable: true),
                    TipoDeProductoId = table.Column<int>(type: "integer", nullable: true),
                    TipoDeElementoId = table.Column<int>(type: "integer", nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaRecepcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstadoTareaId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Duracion = table.Column<int>(type: "integer", nullable: false),
                    Frecuencia = table.Column<int>(type: "integer", nullable: false),
                    ArchivoId = table.Column<int>(type: "integer", nullable: true),
                    RemitoId = table.Column<int>(type: "integer", nullable: true),
                    ContactoId1 = table.Column<int>(type: "integer", nullable: true),
                    TipoTareaId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tareas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tareas_Archivos_ArchivoId",
                        column: x => x.ArchivoId,
                        principalTable: "Archivos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_Contactos_ContactoId",
                        column: x => x.ContactoId,
                        principalTable: "Contactos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_Contactos_ContactoId1",
                        column: x => x.ContactoId1,
                        principalTable: "Contactos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_EstadoTareas_EstadoTareaId",
                        column: x => x.EstadoTareaId,
                        principalTable: "EstadoTareas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tareas_Periodicidades_PeriodicidadId",
                        column: x => x.PeriodicidadId,
                        principalTable: "Periodicidades",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_Presupuestos_PresupuestoId",
                        column: x => x.PresupuestoId,
                        principalTable: "Presupuestos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_Prioridades_PrioridadId",
                        column: x => x.PrioridadId,
                        principalTable: "Prioridades",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_Remitos_RemitoId",
                        column: x => x.RemitoId,
                        principalTable: "Remitos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tareas_TipoTareas_TipoDeTareaId",
                        column: x => x.TipoDeTareaId,
                        principalTable: "TipoTareas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tareas_TipoTareas_TipoTareaId",
                        column: x => x.TipoTareaId,
                        principalTable: "TipoTareas",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_TiposElemento_TipoDeElementoId",
                        column: x => x.TipoDeElementoId,
                        principalTable: "TiposElemento",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_TiposProducto_TipoDeProductoId",
                        column: x => x.TipoDeProductoId,
                        principalTable: "TiposProducto",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tareas_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrdenesDeTrabajoDetalle",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrdenDeTrabajoId = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false),
                    Precio = table.Column<decimal>(type: "numeric", nullable: false),
                    Total = table.Column<decimal>(type: "numeric", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrdenesDeTrabajoDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrdenesDeTrabajoDetalle_OrdenesDeTrabajo_OrdenDeTrabajoId",
                        column: x => x.OrdenDeTrabajoId,
                        principalTable: "OrdenesDeTrabajo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Relevamientos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TipoDeProductoId = table.Column<int>(type: "integer", nullable: false),
                    SucursalId = table.Column<int>(type: "integer", nullable: false),
                    TipoDeElementoId = table.Column<int>(type: "integer", nullable: true),
                    CheckListId = table.Column<int>(type: "integer", nullable: false),
                    TareaId = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Leyenda = table.Column<string>(type: "text", nullable: true),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    FechaRecepcion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstadoTareaId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    RemitoId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Relevamientos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Relevamientos_CheckLists_CheckListId",
                        column: x => x.CheckListId,
                        principalTable: "CheckLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Relevamientos_EstadoTareas_EstadoTareaId",
                        column: x => x.EstadoTareaId,
                        principalTable: "EstadoTareas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Relevamientos_Remitos_RemitoId",
                        column: x => x.RemitoId,
                        principalTable: "Remitos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Relevamientos_Sucursales_SucursalId",
                        column: x => x.SucursalId,
                        principalTable: "Sucursales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Relevamientos_Tareas_TareaId",
                        column: x => x.TareaId,
                        principalTable: "Tareas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Relevamientos_TiposElemento_TipoDeElementoId",
                        column: x => x.TipoDeElementoId,
                        principalTable: "TiposElemento",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Relevamientos_TiposProducto_TipoDeProductoId",
                        column: x => x.TipoDeProductoId,
                        principalTable: "TiposProducto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Relevamientos_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TareaDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TareaId = table.Column<int>(type: "integer", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TareaDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TareaDetalles_Tareas_TareaId",
                        column: x => x.TareaId,
                        principalTable: "Tareas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TareaDetalles_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RelevamientoDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Latitud = table.Column<float>(type: "real", nullable: false),
                    Longitud = table.Column<float>(type: "real", nullable: false),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    ProductoId = table.Column<int>(type: "integer", nullable: false),
                    RelevamientoId = table.Column<int>(type: "integer", nullable: false),
                    PuestoId = table.Column<int>(type: "integer", nullable: true),
                    ArchivoId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelevamientoDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalles_Archivos_ArchivoId",
                        column: x => x.ArchivoId,
                        principalTable: "Archivos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalles_Puestos_PuestoId",
                        column: x => x.PuestoId,
                        principalTable: "Puestos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalles_Relevamientos_RelevamientoId",
                        column: x => x.RelevamientoId,
                        principalTable: "Relevamientos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RelevamientoDetalleFotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ArchivoId = table.Column<int>(type: "integer", nullable: false),
                    RelevamientoDetalleId = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelevamientoDetalleFotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalleFotos_Archivos_ArchivoId",
                        column: x => x.ArchivoId,
                        principalTable: "Archivos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalleFotos_RelevamientoDetalles_RelevamientoD~",
                        column: x => x.RelevamientoDetalleId,
                        principalTable: "RelevamientoDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RelevamientoDetalleResultados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Conformidad = table.Column<bool>(type: "boolean", nullable: false),
                    Valor = table.Column<string>(type: "text", nullable: true),
                    Observaciones = table.Column<string>(type: "text", nullable: true),
                    Urgencia = table.Column<int>(type: "integer", nullable: true),
                    RelevamientoDetalleId = table.Column<int>(type: "integer", nullable: false),
                    CheckListDetalleId = table.Column<int>(type: "integer", nullable: false),
                    ArchivoId = table.Column<int>(type: "integer", nullable: true),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RelevamientoDetalleResultados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalleResultados_Archivos_ArchivoId",
                        column: x => x.ArchivoId,
                        principalTable: "Archivos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalleResultados_CheckListDetalles_CheckListDe~",
                        column: x => x.CheckListDetalleId,
                        principalTable: "CheckListDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RelevamientoDetalleResultados_RelevamientoDetalles_Relevami~",
                        column: x => x.RelevamientoDetalleId,
                        principalTable: "RelevamientoDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Actions_AppId",
                table: "Actions",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_AlcanceDetalles_TipoDeProductoId",
                table: "AlcanceDetalles",
                column: "TipoDeProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_Code",
                table: "Applications",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPermissions_AppId",
                table: "AppPermissions",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_AppPermissions_AppId1",
                table: "AppPermissions",
                column: "AppId1");

            migrationBuilder.CreateIndex(
                name: "IX_AppPermissions_PermissionId",
                table: "AppPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppPermissions_PermissionId1",
                table: "AppPermissions",
                column: "PermissionId1");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivoPresupuesto_PresupuestoId",
                table: "ArchivoPresupuesto",
                column: "PresupuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_Archivos_ClienteId",
                table: "Archivos",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckListDetalles_CheckListId",
                table: "CheckListDetalles",
                column: "CheckListId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckListDetalles_TipoDeDatoId",
                table: "CheckListDetalles",
                column: "TipoDeDatoId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckLists_ClienteId",
                table: "CheckLists",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckLists_SucursalId",
                table: "CheckLists",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckLists_TipoDeElementoId",
                table: "CheckLists",
                column: "TipoDeElementoId");

            migrationBuilder.CreateIndex(
                name: "IX_CheckLists_TipoDeProductoId",
                table: "CheckLists",
                column: "TipoDeProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteAlcanceDetalles_AlcanceDetalleId",
                table: "ClienteAlcanceDetalles",
                column: "AlcanceDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteAlcanceDetalles_ClienteId",
                table: "ClienteAlcanceDetalles",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteAlcances_ClienteId",
                table: "ClienteAlcances",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteAlcances_PeriodicidadId",
                table: "ClienteAlcances",
                column: "PeriodicidadId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteAlcances_TipoDeElementoId",
                table: "ClienteAlcances",
                column: "TipoDeElementoId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteAlcances_TipoDeProductoId",
                table: "ClienteAlcances",
                column: "TipoDeProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteAlcances_TipoDeServicioId",
                table: "ClienteAlcances",
                column: "TipoDeServicioId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteArchivos_ArchivoId",
                table: "ClienteArchivos",
                column: "ArchivoId");

            migrationBuilder.CreateIndex(
                name: "IX_ClienteArchivos_ClienteId",
                table: "ClienteArchivos",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_BusinessCenterId",
                table: "Clientes",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_BusinessCenterId1",
                table: "Clientes",
                column: "BusinessCenterId1");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_TipoDeClienteId",
                table: "Clientes",
                column: "TipoDeClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_TipoDeServicioId",
                table: "Clientes",
                column: "TipoDeServicioId");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_VendedorId",
                table: "Clientes",
                column: "VendedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Contactos_SucursalId",
                table: "Contactos",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_Contactos_UsuarioId",
                table: "Contactos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Elementos_BusinessCenterId",
                table: "Elementos",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Elementos_QRId",
                table: "Elementos",
                column: "QRId");

            migrationBuilder.CreateIndex(
                name: "IX_Elementos_SucursalId",
                table: "Elementos",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_Elementos_TipoDeElementoId",
                table: "Elementos",
                column: "TipoDeElementoId");

            migrationBuilder.CreateIndex(
                name: "IX_ElementosTipoElementoDetalle_ElementoId",
                table: "ElementosTipoElementoDetalle",
                column: "ElementoId");

            migrationBuilder.CreateIndex(
                name: "IX_ElementosTipoElementoDetalle_TipoElementoDetalleId",
                table: "ElementosTipoElementoDetalle",
                column: "TipoElementoDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_Extintores_BusinessCenterId",
                table: "Extintores",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Extintores_CapacidadId",
                table: "Extintores",
                column: "CapacidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Extintores_ClienteId",
                table: "Extintores",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Extintores_FabricanteId",
                table: "Extintores",
                column: "FabricanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Extintores_QRId",
                table: "Extintores",
                column: "QRId");

            migrationBuilder.CreateIndex(
                name: "IX_Extintores_SucursalId",
                table: "Extintores",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_Extintores_TipoDeCargaId",
                table: "Extintores",
                column: "TipoDeCargaId");

            migrationBuilder.CreateIndex(
                name: "IX_Localidades_ProvinciaId",
                table: "Localidades",
                column: "ProvinciaId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeTrabajo_EstadoDeOTId",
                table: "OrdenesDeTrabajo",
                column: "EstadoDeOTId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeTrabajo_PrioridadId",
                table: "OrdenesDeTrabajo",
                column: "PrioridadId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeTrabajo_RemitoId",
                table: "OrdenesDeTrabajo",
                column: "RemitoId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeTrabajo_SucursalId",
                table: "OrdenesDeTrabajo",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeTrabajo_UsuarioId",
                table: "OrdenesDeTrabajo",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_OrdenesDeTrabajoDetalle_OrdenDeTrabajoId",
                table: "OrdenesDeTrabajoDetalle",
                column: "OrdenDeTrabajoId");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_ActionId",
                table: "Permissions",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_ResourceId",
                table: "Permissions",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_PresupuestoArchivos_ArchivoId",
                table: "PresupuestoArchivos",
                column: "ArchivoId");

            migrationBuilder.CreateIndex(
                name: "IX_PresupuestoArchivos_PresupuestoId",
                table: "PresupuestoArchivos",
                column: "PresupuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_PresupuestoRemitos_PresupuestoId",
                table: "PresupuestoRemitos",
                column: "PresupuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_PresupuestoRemitos_RemitoId",
                table: "PresupuestoRemitos",
                column: "RemitoId");

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_SucursalId",
                table: "Presupuestos",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_Presupuestos_UsuarioId",
                table: "Presupuestos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Provincias_PaisId",
                table: "Provincias",
                column: "PaisId");

            migrationBuilder.CreateIndex(
                name: "IX_Puestos_BusinessCenterId",
                table: "Puestos",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Puestos_ExtintorId",
                table: "Puestos",
                column: "ExtintorId");

            migrationBuilder.CreateIndex(
                name: "IX_Puestos_QRId",
                table: "Puestos",
                column: "QRId");

            migrationBuilder.CreateIndex(
                name: "IX_Puestos_SucursalId",
                table: "Puestos",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalleFotos_ArchivoId",
                table: "RelevamientoDetalleFotos",
                column: "ArchivoId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalleFotos_RelevamientoDetalleId",
                table: "RelevamientoDetalleFotos",
                column: "RelevamientoDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalleResultados_ArchivoId",
                table: "RelevamientoDetalleResultados",
                column: "ArchivoId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalleResultados_CheckListDetalleId",
                table: "RelevamientoDetalleResultados",
                column: "CheckListDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalleResultados_RelevamientoDetalleId",
                table: "RelevamientoDetalleResultados",
                column: "RelevamientoDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalles_ArchivoId",
                table: "RelevamientoDetalles",
                column: "ArchivoId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalles_PuestoId",
                table: "RelevamientoDetalles",
                column: "PuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_RelevamientoDetalles_RelevamientoId",
                table: "RelevamientoDetalles",
                column: "RelevamientoId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_CheckListId",
                table: "Relevamientos",
                column: "CheckListId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_EstadoTareaId",
                table: "Relevamientos",
                column: "EstadoTareaId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_RemitoId",
                table: "Relevamientos",
                column: "RemitoId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_SucursalId",
                table: "Relevamientos",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_TareaId",
                table: "Relevamientos",
                column: "TareaId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_TipoDeElementoId",
                table: "Relevamientos",
                column: "TipoDeElementoId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_TipoDeProductoId",
                table: "Relevamientos",
                column: "TipoDeProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_Relevamientos_UsuarioId",
                table: "Relevamientos",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Remitos_ChoferId",
                table: "Remitos",
                column: "ChoferId");

            migrationBuilder.CreateIndex(
                name: "IX_Remitos_EstadoRemitoId",
                table: "Remitos",
                column: "EstadoRemitoId");

            migrationBuilder.CreateIndex(
                name: "IX_Remitos_RemitoManualId",
                table: "Remitos",
                column: "RemitoManualId");

            migrationBuilder.CreateIndex(
                name: "IX_Remitos_RemitoOficialId",
                table: "Remitos",
                column: "RemitoOficialId");

            migrationBuilder.CreateIndex(
                name: "IX_Remitos_RemitoUsuarioId",
                table: "Remitos",
                column: "RemitoUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Remitos_SucursalId",
                table: "Remitos",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_RemitoUsuarios_ChoferId",
                table: "RemitoUsuarios",
                column: "ChoferId");

            migrationBuilder.CreateIndex(
                name: "IX_Resources_AppId",
                table: "Resources",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleAppAccesses_AppId",
                table: "RoleAppAccesses",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleAppAccesses_GrantedBy",
                table: "RoleAppAccesses",
                column: "GrantedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RoleAppAccesses_RoleId",
                table: "RoleAppAccesses",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleCenterAccesses_AppId",
                table: "RoleCenterAccesses",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleCenterAccesses_BusinessCenterId",
                table: "RoleCenterAccesses",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleCenterAccesses_GrantedBy",
                table: "RoleCenterAccesses",
                column: "GrantedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RoleCenterAccesses_RoleId",
                table: "RoleCenterAccesses",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_GrantedBy",
                table: "RolePermissions",
                column: "GrantedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleTemplatePermissions_PermissionId",
                table: "RoleTemplatePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleTemplatePermissions_PermissionId1",
                table: "RoleTemplatePermissions",
                column: "PermissionId1");

            migrationBuilder.CreateIndex(
                name: "IX_RoleTemplatePermissions_RoleTemplateId",
                table: "RoleTemplatePermissions",
                column: "RoleTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Sucursales_BusinessCenterId",
                table: "Sucursales",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_Sucursales_ClienteId",
                table: "Sucursales",
                column: "ClienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Sucursales_LocalidadId",
                table: "Sucursales",
                column: "LocalidadId");

            migrationBuilder.CreateIndex(
                name: "IX_TareaDetalles_TareaId",
                table: "TareaDetalles",
                column: "TareaId");

            migrationBuilder.CreateIndex(
                name: "IX_TareaDetalles_UsuarioId",
                table: "TareaDetalles",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_ArchivoId",
                table: "Tareas",
                column: "ArchivoId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_ContactoId",
                table: "Tareas",
                column: "ContactoId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_ContactoId1",
                table: "Tareas",
                column: "ContactoId1");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_EstadoTareaId",
                table: "Tareas",
                column: "EstadoTareaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_PeriodicidadId",
                table: "Tareas",
                column: "PeriodicidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_PresupuestoId",
                table: "Tareas",
                column: "PresupuestoId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_PrioridadId",
                table: "Tareas",
                column: "PrioridadId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_RemitoId",
                table: "Tareas",
                column: "RemitoId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_SucursalId",
                table: "Tareas",
                column: "SucursalId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_TipoDeElementoId",
                table: "Tareas",
                column: "TipoDeElementoId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_TipoDeProductoId",
                table: "Tareas",
                column: "TipoDeProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_TipoDeTareaId",
                table: "Tareas",
                column: "TipoDeTareaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_TipoTareaId",
                table: "Tareas",
                column: "TipoTareaId");

            migrationBuilder.CreateIndex(
                name: "IX_Tareas_UsuarioId",
                table: "Tareas",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_TiposDeCarga_UnidadDeMedidaId",
                table: "TiposDeCarga",
                column: "UnidadDeMedidaId");

            migrationBuilder.CreateIndex(
                name: "IX_TiposElementoDetalle_TipoDatoId",
                table: "TiposElementoDetalle",
                column: "TipoDatoId");

            migrationBuilder.CreateIndex(
                name: "IX_TiposElementoDetalle_TipoElementoId",
                table: "TiposElementoDetalle",
                column: "TipoElementoId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAppAccesses_AppId",
                table: "UserAppAccesses",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAppAccesses_AppId1",
                table: "UserAppAccesses",
                column: "AppId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserAppAccesses_UserId",
                table: "UserAppAccesses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAppAccesses_UserId1",
                table: "UserAppAccesses",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserCenterAppAccesses_AppId",
                table: "UserCenterAppAccesses",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCenterAppAccesses_BusinessCenterId",
                table: "UserCenterAppAccesses",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCenterAppAccesses_BusinessCenterId1",
                table: "UserCenterAppAccesses",
                column: "BusinessCenterId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserCenterAppAccesses_UserId",
                table: "UserCenterAppAccesses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCenterAppAccesses_UserId1",
                table: "UserCenterAppAccesses",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionMatrices_ActionId",
                table: "UserPermissionMatrices",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionMatrices_AppId",
                table: "UserPermissionMatrices",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionMatrices_BusinessCenterId",
                table: "UserPermissionMatrices",
                column: "BusinessCenterId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionMatrices_ResourceId",
                table: "UserPermissionMatrices",
                column: "ResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionMatrices_UserId",
                table: "UserPermissionMatrices",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId1",
                table: "Users",
                column: "RoleId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppPermissions");

            migrationBuilder.DropTable(
                name: "ArchivoPresupuesto");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "ClienteAlcanceDetalles");

            migrationBuilder.DropTable(
                name: "ClienteAlcances");

            migrationBuilder.DropTable(
                name: "ClienteArchivos");

            migrationBuilder.DropTable(
                name: "ElementosTipoElementoDetalle");

            migrationBuilder.DropTable(
                name: "OrdenesDeTrabajoDetalle");

            migrationBuilder.DropTable(
                name: "PresupuestoArchivos");

            migrationBuilder.DropTable(
                name: "PresupuestoRemitos");

            migrationBuilder.DropTable(
                name: "RelevamientoDetalleFotos");

            migrationBuilder.DropTable(
                name: "RelevamientoDetalleResultados");

            migrationBuilder.DropTable(
                name: "RoleAppAccesses");

            migrationBuilder.DropTable(
                name: "RoleCenterAccesses");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "RoleTemplatePermissions");

            migrationBuilder.DropTable(
                name: "TareaDetalles");

            migrationBuilder.DropTable(
                name: "TiposRemito");

            migrationBuilder.DropTable(
                name: "UserAppAccesses");

            migrationBuilder.DropTable(
                name: "UserCenterAppAccesses");

            migrationBuilder.DropTable(
                name: "UserPermissionMatrices");

            migrationBuilder.DropTable(
                name: "AlcanceDetalles");

            migrationBuilder.DropTable(
                name: "Elementos");

            migrationBuilder.DropTable(
                name: "TiposElementoDetalle");

            migrationBuilder.DropTable(
                name: "OrdenesDeTrabajo");

            migrationBuilder.DropTable(
                name: "CheckListDetalles");

            migrationBuilder.DropTable(
                name: "RelevamientoDetalles");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "RoleTemplates");

            migrationBuilder.DropTable(
                name: "EstadosDeOT");

            migrationBuilder.DropTable(
                name: "TiposDato");

            migrationBuilder.DropTable(
                name: "Puestos");

            migrationBuilder.DropTable(
                name: "Relevamientos");

            migrationBuilder.DropTable(
                name: "Actions");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropTable(
                name: "Extintores");

            migrationBuilder.DropTable(
                name: "CheckLists");

            migrationBuilder.DropTable(
                name: "Tareas");

            migrationBuilder.DropTable(
                name: "Applications");

            migrationBuilder.DropTable(
                name: "Capacidades");

            migrationBuilder.DropTable(
                name: "Fabricantes");

            migrationBuilder.DropTable(
                name: "QRs");

            migrationBuilder.DropTable(
                name: "TiposDeCarga");

            migrationBuilder.DropTable(
                name: "Contactos");

            migrationBuilder.DropTable(
                name: "EstadoTareas");

            migrationBuilder.DropTable(
                name: "Periodicidades");

            migrationBuilder.DropTable(
                name: "Presupuestos");

            migrationBuilder.DropTable(
                name: "Prioridades");

            migrationBuilder.DropTable(
                name: "Remitos");

            migrationBuilder.DropTable(
                name: "TipoTareas");

            migrationBuilder.DropTable(
                name: "TiposElemento");

            migrationBuilder.DropTable(
                name: "TiposProducto");

            migrationBuilder.DropTable(
                name: "UnidadesDeMedida");

            migrationBuilder.DropTable(
                name: "Archivos");

            migrationBuilder.DropTable(
                name: "EstadosRemito");

            migrationBuilder.DropTable(
                name: "RemitoUsuarios");

            migrationBuilder.DropTable(
                name: "Sucursales");

            migrationBuilder.DropTable(
                name: "Clientes");

            migrationBuilder.DropTable(
                name: "Localidades");

            migrationBuilder.DropTable(
                name: "BusinessCenters");

            migrationBuilder.DropTable(
                name: "TiposDeCliente");

            migrationBuilder.DropTable(
                name: "TiposDeServicio");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Provincias");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Paises");
        }
    }
}
