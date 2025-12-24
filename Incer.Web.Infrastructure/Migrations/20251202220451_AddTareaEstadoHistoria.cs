using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Incer.Web.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTareaEstadoHistoria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TareasEstadosHistoria",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    TareaId = table.Column<int>(type: "integer", nullable: false),
                    EstadoTareaId = table.Column<int>(type: "integer", nullable: false),
                    RelevamientoId = table.Column<int>(type: "integer", nullable: true),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    FechaEstablecida = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsuarioIdEstablecido = table.Column<int>(type: "integer", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    FechaUpdate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsuarioCreacion = table.Column<string>(type: "text", nullable: false),
                    UsuarioUpdate = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TareasEstadosHistoria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TareasEstadosHistoria_EstadoTareas_EstadoTareaId",
                        column: x => x.EstadoTareaId,
                        principalTable: "EstadoTareas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TareasEstadosHistoria_Relevamientos_RelevamientoId",
                        column: x => x.RelevamientoId,
                        principalTable: "Relevamientos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TareasEstadosHistoria_Tareas_TareaId",
                        column: x => x.TareaId,
                        principalTable: "Tareas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TareasEstadosHistoria_Users_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TareasEstadosHistoria_Users_UsuarioIdEstablecido",
                        column: x => x.UsuarioIdEstablecido,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TareasEstadosHistoria_EstadoTareaId",
                table: "TareasEstadosHistoria",
                column: "EstadoTareaId");

            migrationBuilder.CreateIndex(
                name: "IX_TareasEstadosHistoria_RelevamientoId",
                table: "TareasEstadosHistoria",
                column: "RelevamientoId");

            migrationBuilder.CreateIndex(
                name: "IX_TareasEstadosHistoria_TareaId",
                table: "TareasEstadosHistoria",
                column: "TareaId");

            migrationBuilder.CreateIndex(
                name: "IX_TareasEstadosHistoria_UsuarioId",
                table: "TareasEstadosHistoria",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_TareasEstadosHistoria_UsuarioIdEstablecido",
                table: "TareasEstadosHistoria",
                column: "UsuarioIdEstablecido");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TareasEstadosHistoria");
        }
    }
}
