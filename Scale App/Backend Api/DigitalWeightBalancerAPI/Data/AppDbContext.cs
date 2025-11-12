using Microsoft.EntityFrameworkCore;
using DigitalWeightBalancerAPI.Models;

namespace DigitalWeightBalancerAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> tbl_User { get; set; }
        public DbSet<UserPin> tbl_UserPin { get; set; }
        public DbSet<Scan> tblScan { get; set; }
        public DbSet<Item> tbl_Item { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().ToTable("tbl_User");
            modelBuilder.Entity<UserPin>().ToTable("tbl_UserPin");
            modelBuilder.Entity<Scan>().ToTable("tblScale");
        }
    }
}
