using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using YgoCardEngine.Domain.Cards;
using YgoCardEngine.Domain.Users;

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
        public DbSet<CardGroup> CardGroups { get; set; }
        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<CardInfo>(b =>
            {
                b.ToTable("CardInfo");
                b.Property(p => p.Id).IsRequired(true);
                b.Property(p => p.Name).IsRequired(true).HasMaxLength(2048);
                b.Property(p => p.Desc).IsRequired(true).HasMaxLength(2048);
            });

            modelBuilder.Entity<CardGroup>(b =>
            {
                b.ToTable("CardGroup");
                b.Property(p => p.Id).IsRequired(true).HasMaxLength(36);
                b.Property(p => p.Title).IsRequired(true).HasMaxLength(64);
                b.Property(p => p.Tag).HasMaxLength(128);
                b.Property(p => p.CardGroupInfo).IsRequired(true).HasMaxLength(256);
            });

            modelBuilder.Entity<User>(b =>
            {
                b.ToTable("User");
                b.Property(p => p.Id).IsRequired(true).HasMaxLength(36);
            });

        }
    }
}
