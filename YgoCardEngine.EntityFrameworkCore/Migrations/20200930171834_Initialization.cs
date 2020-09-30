using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace YgoCardEngine.EntityFrameworkCore.Migrations
{
    public partial class Initialization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CardInfo",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(maxLength: 2048, nullable: false),
                    Desc = table.Column<string>(maxLength: 2048, nullable: false),
                    Ot = table.Column<int>(nullable: false),
                    Alias = table.Column<int>(nullable: false),
                    SetCode = table.Column<long>(nullable: false),
                    Type = table.Column<int>(nullable: false),
                    Atk = table.Column<int>(nullable: false),
                    Def = table.Column<int>(nullable: false),
                    Level = table.Column<long>(nullable: false),
                    Race = table.Column<int>(nullable: false),
                    Attribute = table.Column<int>(nullable: false),
                    Category = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<Guid>(maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CardGroup",
                columns: table => new
                {
                    Id = table.Column<Guid>(maxLength: 36, nullable: false),
                    UserId = table.Column<Guid>(nullable: true),
                    Title = table.Column<string>(maxLength: 64, nullable: false),
                    Tag = table.Column<string>(maxLength: 128, nullable: true),
                    CardGroupInfo = table.Column<string>(maxLength: 256, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CardGroup", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CardGroup_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CardGroup_UserId",
                table: "CardGroup",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardGroup");

            migrationBuilder.DropTable(
                name: "CardInfo");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
