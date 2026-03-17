using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Application.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NewImageTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TitleImageModelId",
                table: "Theories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TitleImageModelId",
                table: "TasksCreator",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Theories_TitleImageModelId",
                table: "Theories",
                column: "TitleImageModelId");

            migrationBuilder.CreateIndex(
                name: "IX_TasksCreator_TitleImageModelId",
                table: "TasksCreator",
                column: "TitleImageModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_TasksCreator_Image_TitleImageModelId",
                table: "TasksCreator",
                column: "TitleImageModelId",
                principalTable: "Image",
                principalColumn: "ModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_Theories_Image_TitleImageModelId",
                table: "Theories",
                column: "TitleImageModelId",
                principalTable: "Image",
                principalColumn: "ModelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TasksCreator_Image_TitleImageModelId",
                table: "TasksCreator");

            migrationBuilder.DropForeignKey(
                name: "FK_Theories_Image_TitleImageModelId",
                table: "Theories");

            migrationBuilder.DropIndex(
                name: "IX_Theories_TitleImageModelId",
                table: "Theories");

            migrationBuilder.DropIndex(
                name: "IX_TasksCreator_TitleImageModelId",
                table: "TasksCreator");

            migrationBuilder.DropColumn(
                name: "TitleImageModelId",
                table: "Theories");

            migrationBuilder.DropColumn(
                name: "TitleImageModelId",
                table: "TasksCreator");
        }
    }
}
