using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Application.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CodeProblemEntity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Difficulty = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodeProblemEntity", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExecutionResults",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uuid", nullable: false),
                    Success = table.Column<bool>(type: "boolean", nullable: false),
                    Output = table.Column<string>(type: "text", nullable: false),
                    Error = table.Column<string>(type: "text", nullable: false),
                    ExecutionTime = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExecutionResults", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "CodeTemplateEntity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    TemplateCode = table.Column<string>(type: "text", nullable: false),
                    CodeProblemEntityId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodeTemplateEntity", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodeTemplateEntity_CodeProblemEntity_CodeProblemEntityId",
                        column: x => x.CodeProblemEntityId,
                        principalTable: "CodeProblemEntity",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TestCasesEntity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CodeProblemEntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Input = table.Column<string>(type: "text", nullable: false),
                    ExpectedOutput = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestCasesEntity", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TestCasesEntity_CodeProblemEntity_CodeProblemEntityId",
                        column: x => x.CodeProblemEntityId,
                        principalTable: "CodeProblemEntity",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodeTemplateEntity_CodeProblemEntityId",
                table: "CodeTemplateEntity",
                column: "CodeProblemEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_TestCasesEntity_CodeProblemEntityId",
                table: "TestCasesEntity",
                column: "CodeProblemEntityId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodeTemplateEntity");

            migrationBuilder.DropTable(
                name: "ExecutionResults");

            migrationBuilder.DropTable(
                name: "TestCasesEntity");

            migrationBuilder.DropTable(
                name: "CodeProblemEntity");
        }
    }
}
