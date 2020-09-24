using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using YgoCardEngine.Domain.Cards;
// ReSharper disable All

namespace YgoCardEngine.EntityFrameworkCore.EntityFrameworkCore
{
    public class YgoCardEngineDbContext : DbContext
    {
        public YgoCardEngineDbContext(DbContextOptions<YgoCardEngineDbContext> options)
            : base(options)
        {

        }
        public DbSet<CardDatas> CardDatas { get; set; }
        public DbSet<CardTexts> CardTexts { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<CardDatas>(b =>
            {
                b.ToTable("datas");
            });
            modelBuilder.Entity<CardTexts>(b =>
            {
                b.ToTable("texts");
            });


        }
    }
}
