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
        public DbSet<CardInfo> CardInfo { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<CardInfo>(b =>
            {
                b.ToTable("CardInfo");
                b.Property(p => p.Name).IsRequired(true).HasMaxLength(2048);
                b.Property(p => p.Desc).IsRequired(true).HasMaxLength(2048);
            });



        }
    }
}
