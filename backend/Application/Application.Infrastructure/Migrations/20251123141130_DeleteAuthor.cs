using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Application.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DeleteAuthor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Autors_AutorId",
                table: "Courses");

            migrationBuilder.DropForeignKey(
                name: "FK_TasksCreator_Chapters_ChapterId",
                table: "TasksCreator");

            migrationBuilder.DropForeignKey(
                name: "FK_Theories_Chapters_ChapterId",
                table: "Theories");

            migrationBuilder.DropTable(
                name: "Autors");

            migrationBuilder.DropIndex(
                name: "IX_Courses_AutorId",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "ChpterID",
                table: "Theories");

            migrationBuilder.DropColumn(
                name: "ChpterID",
                table: "TasksCreator");

            migrationBuilder.DropColumn(
                name: "AutorId",
                table: "Courses");

            migrationBuilder.RenameColumn(
                name: "ChapterId",
                table: "Theories",
                newName: "ChapterID");

            migrationBuilder.RenameIndex(
                name: "IX_Theories_ChapterId",
                table: "Theories",
                newName: "IX_Theories_ChapterID");

            migrationBuilder.RenameColumn(
                name: "ChapterId",
                table: "TasksCreator",
                newName: "ChapterID");

            migrationBuilder.RenameIndex(
                name: "IX_TasksCreator_ChapterId",
                table: "TasksCreator",
                newName: "IX_TasksCreator_ChapterID");

            migrationBuilder.AlterColumn<Guid>(
                name: "ChapterID",
                table: "Theories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ChapterID",
                table: "TasksCreator",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TasksCreator_Chapters_ChapterID",
                table: "TasksCreator",
                column: "ChapterID",
                principalTable: "Chapters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Theories_Chapters_ChapterID",
                table: "Theories",
                column: "ChapterID",
                principalTable: "Chapters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TasksCreator_Chapters_ChapterID",
                table: "TasksCreator");

            migrationBuilder.DropForeignKey(
                name: "FK_Theories_Chapters_ChapterID",
                table: "Theories");

            migrationBuilder.RenameColumn(
                name: "ChapterID",
                table: "Theories",
                newName: "ChapterId");

            migrationBuilder.RenameIndex(
                name: "IX_Theories_ChapterID",
                table: "Theories",
                newName: "IX_Theories_ChapterId");

            migrationBuilder.RenameColumn(
                name: "ChapterID",
                table: "TasksCreator",
                newName: "ChapterId");

            migrationBuilder.RenameIndex(
                name: "IX_TasksCreator_ChapterID",
                table: "TasksCreator",
                newName: "IX_TasksCreator_ChapterId");

            migrationBuilder.AlterColumn<Guid>(
                name: "ChapterId",
                table: "Theories",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "ChpterID",
                table: "Theories",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<Guid>(
                name: "ChapterId",
                table: "TasksCreator",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<Guid>(
                name: "ChpterID",
                table: "TasksCreator",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "AutorId",
                table: "Courses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Autors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CountCourses = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Autors", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_AutorId",
                table: "Courses",
                column: "AutorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Autors_AutorId",
                table: "Courses",
                column: "AutorId",
                principalTable: "Autors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TasksCreator_Chapters_ChapterId",
                table: "TasksCreator",
                column: "ChapterId",
                principalTable: "Chapters",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Theories_Chapters_ChapterId",
                table: "Theories",
                column: "ChapterId",
                principalTable: "Chapters",
                principalColumn: "Id");
        }
    }
}
