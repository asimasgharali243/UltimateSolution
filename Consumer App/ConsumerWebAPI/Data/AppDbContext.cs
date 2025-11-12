using Microsoft.EntityFrameworkCore;
using ConsumerWebAPI.Models;

namespace ConsumerWebAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> tbl_User { get; set; }
        public DbSet<BillPreview> BillPreviews { get; set; }
         public DbSet<AccountLedger> AccountLedgers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("tbl_User");
            modelBuilder.Entity<BillPreview>().ToTable("BillPreview");
        }
    }
}
