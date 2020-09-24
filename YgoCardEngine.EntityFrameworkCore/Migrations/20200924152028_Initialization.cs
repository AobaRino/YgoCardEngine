using Microsoft.EntityFrameworkCore.Migrations;

namespace YgoCardEngine.EntityFrameworkCore.Migrations
{
    public partial class Initialization : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "datas",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Ot = table.Column<int>(nullable: false),
                    Alias = table.Column<int>(nullable: false),
                    SetCode = table.Column<int>(nullable: false),
                    Type = table.Column<int>(nullable: false),
                    Atk = table.Column<int>(nullable: false),
                    Def = table.Column<int>(nullable: false),
                    Level = table.Column<int>(nullable: false),
                    Race = table.Column<int>(nullable: false),
                    Attribute = table.Column<int>(nullable: false),
                    Category = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "texts",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(nullable: true),
                    Desc = table.Column<string>(nullable: true),
                    Str1 = table.Column<string>(nullable: true),
                    Str2 = table.Column<string>(nullable: true),
                    Str3 = table.Column<string>(nullable: true),
                    Str4 = table.Column<string>(nullable: true),
                    Str5 = table.Column<string>(nullable: true),
                    Str6 = table.Column<string>(nullable: true),
                    Str7 = table.Column<string>(nullable: true),
                    Str8 = table.Column<string>(nullable: true),
                    Str9 = table.Column<string>(nullable: true),
                    Str10 = table.Column<string>(nullable: true),
                    Str11 = table.Column<string>(nullable: true),
                    Str12 = table.Column<string>(nullable: true),
                    Str13 = table.Column<string>(nullable: true),
                    Str14 = table.Column<string>(nullable: true),
                    Str15 = table.Column<string>(nullable: true),
                    Str16 = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_texts", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "datas");

            migrationBuilder.DropTable(
                name: "texts");
        }
    }
}
