using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Incer.Web.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixUserAppAccessSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Reset the sequence for UserAppAccesses table to start from the next available ID
            migrationBuilder.Sql("SELECT setval('\"UserAppAccesses_Id_seq\"', (SELECT MAX(\"Id\") FROM \"UserAppAccesses\") + 1, false);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No need to rollback sequence changes
        }
    }
}
