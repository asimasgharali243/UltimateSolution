using Microsoft.EntityFrameworkCore;
using BackendWeightReader.Models;

namespace BackendWeightReader.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> tbl_User { get; set; }
        public DbSet<UserPin> tbl_UserPin { get; set; }
        public DbSet<Scale> tblScale { get; set; }
        public DbSet<Item> tbl_Item { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<User>().ToTable("tbl_User");
            modelBuilder.Entity<UserPin>().ToTable("tbl_UserPin");
            modelBuilder.Entity<Scale>().ToTable("tblScale");
            modelBuilder.Entity<Item>().ToTable("tbl_Item");
        }
    }
}
