using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Application.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PLCOLUM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Pl = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Chapters = table.Column<int>(type: "integer", nullable: false),
                    Complexity = table.Column<int>(type: "integer", nullable: false),
                    Evaluation = table.Column<double>(type: "double precision", nullable: false),
                    Reviews = table.Column<List<string>>(type: "text[]", nullable: false),
                    Subscribe = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Chapters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    NumberTheoryBloks = table.Column<int>(type: "integer", nullable: false),
                    NumberTasks = table.Column<int>(type: "integer", nullable: false),
                    CourseID = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Chapters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Chapters_Courses_CourseID",
                        column: x => x.CourseID,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TasksCreator",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ChapterID = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TasksCreator", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TasksCreator_Chapters_ChapterID",
                        column: x => x.ChapterID,
                        principalTable: "Chapters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Theories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Article = table.Column<string>(type: "text", nullable: false),
                    ChapterID = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Theories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Theories_Chapters_ChapterID",
                        column: x => x.ChapterID,
                        principalTable: "Chapters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Answer = table.Column<bool>(type: "boolean", nullable: false),
                    TaskCreatorId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Questions_TasksCreator_TaskCreatorId",
                        column: x => x.TaskCreatorId,
                        principalTable: "TasksCreator",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_CourseID",
                table: "Chapters",
                column: "CourseID");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_TaskCreatorId",
                table: "Questions",
                column: "TaskCreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_TasksCreator_ChapterID",
                table: "TasksCreator",
                column: "ChapterID");

            migrationBuilder.CreateIndex(
                name: "IX_Theories_ChapterID",
                table: "Theories",
                column: "ChapterID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "Theories");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "TasksCreator");

            migrationBuilder.DropTable(
                name: "Chapters");

            migrationBuilder.DropTable(
                name: "Courses");
        }
    }
}
