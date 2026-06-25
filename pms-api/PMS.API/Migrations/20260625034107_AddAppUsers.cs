using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PMS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAppUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppUsers", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7639), new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7642) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7647), new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7647) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7648), new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7648) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7650), new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7650) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7651), new DateTime(2026, 6, 25, 3, 41, 7, 215, DateTimeKind.Utc).AddTicks(7651) });

            migrationBuilder.CreateIndex(
                name: "IX_AppUsers_Username",
                table: "AppUsers",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppUsers");

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9256), new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9258) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9264), new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9264) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9265), new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9266) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9267), new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9267) });

            migrationBuilder.UpdateData(
                table: "Disciplines",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9268), new DateTime(2026, 6, 24, 23, 21, 50, 463, DateTimeKind.Utc).AddTicks(9268) });
        }
    }
}
