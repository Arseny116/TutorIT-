using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Application.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Autors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CountCourses = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Autors", x => x.Id);
                });

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
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Chapters = table.Column<int>(type: "integer", nullable: false),
                    Сomplexity = table.Column<int>(type: "integer", nullable: false),
                    Evaluation = table.Column<double>(type: "double precision", nullable: false),
                    Reviews = table.Column<List<string>>(type: "text[]", nullable: false),
                    Subscribe = table.Column<int>(type: "integer", nullable: false),
                    AutorId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Courses_Autors_AutorId",
                        column: x => x.AutorId,
                        principalTable: "Autors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                    ChpterID = table.Column<Guid>(type: "uuid", nullable: false),
                    ChapterId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TasksCreator", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TasksCreator_Chapters_ChapterId",
                        column: x => x.ChapterId,
                        principalTable: "Chapters",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Theories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Article = table.Column<string>(type: "text", nullable: false),
                    ChpterID = table.Column<Guid>(type: "uuid", nullable: false),
                    ChapterId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Theories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Theories_Chapters_ChapterId",
                        column: x => x.ChapterId,
                        principalTable: "Chapters",
                        principalColumn: "Id");
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
                name: "IX_CodeTemplateEntity_CodeProblemEntityId",
                table: "CodeTemplateEntity",
                column: "CodeProblemEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_AutorId",
                table: "Courses",
                column: "AutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Questions_TaskCreatorId",
                table: "Questions",
                column: "TaskCreatorId");

            migrationBuilder.CreateIndex(
                name: "IX_TasksCreator_ChapterId",
                table: "TasksCreator",
                column: "ChapterId");

            migrationBuilder.CreateIndex(
                name: "IX_TestCasesEntity_CodeProblemEntityId",
                table: "TestCasesEntity",
                column: "CodeProblemEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_Theories_ChapterId",
                table: "Theories",
                column: "ChapterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodeTemplateEntity");

            migrationBuilder.DropTable(
                name: "ExecutionResults");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "TestCasesEntity");

            migrationBuilder.DropTable(
                name: "Theories");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "TasksCreator");

            migrationBuilder.DropTable(
                name: "CodeProblemEntity");

            migrationBuilder.DropTable(
                name: "Chapters");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Autors");
        }
    }
}
