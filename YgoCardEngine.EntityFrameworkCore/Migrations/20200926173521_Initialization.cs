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
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CardInfo");
        }
    }
}
