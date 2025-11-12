using Microsoft.EntityFrameworkCore.ChangeTracking;
using Backend.DTOs;
using Backend.Helpers;
using System.Security.Claims;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IHttpContextAccessor httpContextAccessor) 
            : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        // AUDIT LOG DbSet
        public DbSet<UserActivityLog> UserActivityLogs { get; set; }

        // Your existing DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<UserForm> UserForms { get; set; }
        public DbSet<UserRights> UserRights { get; set; }
        public DbSet<RateHotel> RateHotels { get; set; }
        public DbSet<RateVisa> RateVisas { get; set; }
        public DbSet<Sector> Sectors { get; set; }
        public DbSet<Package> Packages { get; set; }
        public DbSet<Pax> Paxes { get; set; }
        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<City> Cities { get; set; }
        
        // Quotation related DbSets
        public DbSet<Quotation> Quotations { get; set; }
        public DbSet<QuotationVisaService> QuotationVisaServices { get; set; }
        public DbSet<QuotationTransportation> QuotationTransportations { get; set; }
        public DbSet<QuotationAirlines> QuotationAirlines { get; set; }
        public DbSet<QuotationAccommodation> QuotationAccommodations { get; set; }
        
        // query form
        public DbSet<QueryForm> QueryForms { get; set; }

        // Add this DbSet for your Master model
        public DbSet<Master> Masters { get; set; }
        public DbSet<Detail> Details { get; set; }

        // AUTOMATIC AUDIT METHODS

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = OnBeforeSaveChanges();
            var result = await base.SaveChangesAsync(cancellationToken);
            await OnAfterSaveChanges(auditEntries);
            return result;
        }

        public override int SaveChanges()
        {
            var auditEntries = OnBeforeSaveChanges();
            var result = base.SaveChanges();
            OnAfterSaveChanges(auditEntries).Wait();
            return result;
        }

        private List<AuditEntry> OnBeforeSaveChanges()
        {
            ChangeTracker.DetectChanges();
            var auditEntries = new List<AuditEntry>();

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Detached || 
                    entry.State == EntityState.Unchanged ||
                    entry.Entity is UserActivityLog)
                    continue;

                var auditEntry = new AuditEntry(entry)
                {
                    TableName = entry.Metadata.GetTableName() ?? "Unknown",
                    UserId = GetCurrentUserId(),
                    UserName = GetCurrentUserName(),
                    IPAddress = GetClientIPAddress(),
                    DeviceInfo = GetDeviceInfo()
                };

                auditEntries.Add(auditEntry);

                // Get primary key value
                foreach (var property in entry.Properties)
                {
                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.RecordId = property.CurrentValue?.ToString();
                        break;
                    }
                }

                foreach (var property in entry.Properties)
                {
                    if (property.IsTemporary) continue;

                    string propertyName = property.Metadata.Name;
                    if (property.Metadata.IsPrimaryKey())
                        continue;

                    switch (entry.State)
                    {
                        case EntityState.Added:
                            auditEntry.Changes.Add(new AuditChange
                            {
                                ColumnName = propertyName,
                                NewValue = property.CurrentValue?.ToString(),
                                ActionType = "INSERT"
                            });
                            break;

                        case EntityState.Deleted:
                            auditEntry.Changes.Add(new AuditChange
                            {
                                ColumnName = propertyName,
                                OldValue = property.OriginalValue?.ToString(),
                                ActionType = "DELETE"
                            });
                            break;

                        case EntityState.Modified:
                            if (property.IsModified && !Equals(property.OriginalValue, property.CurrentValue))
                            {
                                auditEntry.Changes.Add(new AuditChange
                                {
                                    ColumnName = propertyName,
                                    OldValue = property.OriginalValue?.ToString(),
                                    NewValue = property.CurrentValue?.ToString(),
                                    ActionType = "UPDATE"
                                });
                            }
                            break;
                    }
                }
            }
            return auditEntries;
        }

        private async Task OnAfterSaveChanges(List<AuditEntry> auditEntries)
        {
            if (!auditEntries.Any()) return;

            var auditLogs = new List<UserActivityLog>();

            foreach (var auditEntry in auditEntries)
            {
                foreach (var change in auditEntry.Changes)
                {
                    auditLogs.Add(new UserActivityLog
                    {
                        UserId = auditEntry.UserId,
                        UserName = auditEntry.UserName,
                        TableName = auditEntry.TableName,
                        RecordId = auditEntry.RecordId,
                        ColumnName = change.ColumnName,
                        OldValue = change.OldValue?.Truncate(4000),
                        NewValue = change.NewValue?.Truncate(4000),
                        ActionType = change.ActionType,
                        ActionDate = DateTime.Now,
                        IPAddress = auditEntry.IPAddress,
                        DeviceInfo = auditEntry.DeviceInfo,
                        Remarks = $"Auto-logged: {change.ActionType} on {auditEntry.TableName}"
                    });
                }
            }

            if (auditLogs.Any())
            {
                await UserActivityLogs.AddRangeAsync(auditLogs);
                await base.SaveChangesAsync();
            }
        }

        #region HELPER METHODS
        private int GetCurrentUserId()
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext == null) return 0;

                var userId = httpContext.User?.FindFirst("userId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    userId = httpContext.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                }
                return int.TryParse(userId, out int id) ? id : 0;
            }
            catch
            {
                return 0;
            }
        }

        private string? GetCurrentUserName()
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                if (httpContext == null) return "System";

                var userName = httpContext.User?.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(userName))
                {
                    userName = httpContext.User?.FindFirst("userName")?.Value;
                }
                return userName ?? "System";
            }
            catch
            {
                return "System";
            }
        }

        private string? GetClientIPAddress()
        {
            try
            {
                return _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
            }
            catch
            {
                return "Unknown";
            }
        }

        private string? GetDeviceInfo()
        {
            try
            {
                return _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"].ToString();
            }
            catch
            {
                return "Unknown";
            }
        }
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ADD UserActivityLog configuration
            modelBuilder.Entity<UserActivityLog>(entity =>
            {
                entity.ToTable("tblUserActivityLog");
                entity.HasKey(e => e.LogId);
                
                entity.Property(e => e.TableName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.ActionType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.UserName).HasMaxLength(100);
                entity.Property(e => e.RecordId).HasMaxLength(50);
                entity.Property(e => e.ColumnName).HasMaxLength(100);
                entity.Property(e => e.IPAddress).HasMaxLength(45);
                entity.Property(e => e.DeviceInfo).HasMaxLength(500);
                entity.Property(e => e.Remarks).HasMaxLength(500);
            });

            // User configuration
            modelBuilder.Entity<User>()
                .ToTable("tblUser")
                .HasIndex(u => u.UserName)
                .IsUnique();

            // UserForm configuration
            modelBuilder.Entity<UserForm>()
                .ToTable("tblUserForm");

            // UserRights configuration
            modelBuilder.Entity<UserRights>()
                .ToTable("tblUserRights");

            // RateHotel configuration
            modelBuilder.Entity<RateHotel>(entity =>
            {
                entity.ToTable("tblRateHotels");
                entity.HasKey(r => r.id);
                
                entity.HasIndex(r => new { r.cityID, r.hotelID })
                    .IsUnique();
            });

            // RateVisa configuration
            modelBuilder.Entity<RateVisa>()
                .ToTable("tblRateVisa");

            // Sector configuration
            modelBuilder.Entity<Sector>()
                .ToTable("tblSector");

            // Package configuration
            modelBuilder.Entity<Package>()
                .ToTable("tblPackage");

            // Pax configuration
            modelBuilder.Entity<Pax>()
                .ToTable("tblPax");

            // Hotel configuration
            modelBuilder.Entity<Hotel>()
                .ToTable("tblHotel");

            // City configuration
            modelBuilder.Entity<City>()
                .ToTable("tblCity");

            // Client configuration
            modelBuilder.Entity<Client>()
                .ToTable("clients")
                .HasKey(e => e.Id);

            // ========== QUOTATION CONFIGURATIONS ==========

            // Quotation configuration - FIXED
            modelBuilder.Entity<Quotation>(entity =>
            {
                entity.ToTable("quotations");
                entity.HasKey(e => e.id);
                
                // FIX: Use IdentityColumn() for SQL Server
                entity.Property(e => e.id)
                      .ValueGeneratedOnAdd()
                      .UseIdentityColumn();

                entity.Property(e => e.quotation_number).HasMaxLength(100);
                entity.Property(e => e.traveling_details).HasMaxLength(500);
                entity.Property(e => e.reference_by).HasMaxLength(255);
                entity.Property(e => e.status).HasMaxLength(50);
                entity.Property(e => e.total_package_cost).HasColumnType("decimal(18,2)");
                entity.Property(e => e.advance_amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.grand_total).HasColumnType("decimal(18,2)");
                entity.Property(e => e.cost_per_person).HasColumnType("decimal(18,2)");

                // Relationships - FIXED: Make sure foreign key properties exist in your models
                entity.HasMany(q => q.Accommodations)
                      .WithOne(a => a.Quotation)
                      .HasForeignKey(a => a.quotation_id)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(q => q.Transportations)
                      .WithOne(t => t.Quotation)
                      .HasForeignKey(t => t.quotation_id)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(q => q.VisaServices)
                      .WithOne(v => v.Quotation)
                      .HasForeignKey(v => v.quotation_id)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(q => q.Airlines)
                      .WithOne(a => a.Quotation)
                      .HasForeignKey(a => a.quotation_id)
                      .OnDelete(DeleteBehavior.Cascade);

                // Add relationship with Client
                entity.HasOne(q => q.Client)
                      .WithMany()
                      .HasForeignKey(q => q.client_id)
                      .OnDelete(DeleteBehavior.Restrict); // Usually restrict delete for client
            });

            // QuotationVisaService configuration - FIXED
            modelBuilder.Entity<QuotationVisaService>(entity =>
            {
                entity.ToTable("quotation_visaService");
                entity.HasKey(e => e.id);
                
                // FIX: Add identity configuration
                entity.Property(e => e.id)
                      .ValueGeneratedOnAdd()
                      .UseIdentityColumn();
                
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Rate).HasColumnType("decimal(18,2)");
            });

            // QuotationTransportation configuration - FIXED
            modelBuilder.Entity<QuotationTransportation>(entity =>
            {
                entity.ToTable("quotation_transportation");
                entity.HasKey(e => e.id);
                
                // FIX: Add identity configuration
                entity.Property(e => e.id)
                      .ValueGeneratedOnAdd()
                      .UseIdentityColumn();
                
                entity.Property(e => e.vehicle_name).HasMaxLength(255);
                entity.Property(e => e.capacity).HasMaxLength(100);
                entity.Property(e => e.rate).HasColumnType("decimal(18,2)");

                // Relationship with Sector
                entity.HasOne(t => t.Sector)
                      .WithMany()
                      .HasForeignKey(t => t.sectorID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // QuotationAirlines configuration - FIXED
            modelBuilder.Entity<QuotationAirlines>(entity =>
            {
                entity.ToTable("quotation_airlines");
                entity.HasKey(e => e.id);
                
                // FIX: Add identity configuration
                entity.Property(e => e.id)
                      .ValueGeneratedOnAdd()
                      .UseIdentityColumn();
                
                entity.Property(e => e.carrier).HasMaxLength(255);
                entity.Property(e => e.@class).HasMaxLength(50);
                entity.Property(e => e.sector).HasMaxLength(100);
                entity.Property(e => e.rate).HasColumnType("decimal(18,2)");
            });

            // QuotationAccommodation configuration - FIXED
            modelBuilder.Entity<QuotationAccommodation>(entity =>
            {
                entity.ToTable("quotation_accommodation");
                entity.HasKey(e => e.id);
                
                // FIX: Add identity configuration
                entity.Property(e => e.id)
                      .ValueGeneratedOnAdd()
                      .UseIdentityColumn();
                
                entity.Property(e => e.room_type).HasMaxLength(50);
                entity.Property(e => e.rate_per_night).HasColumnType("decimal(18,2)");

                // Relationships
                entity.HasOne(a => a.City)
                      .WithMany()
                      .HasForeignKey(a => a.cityID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Hotel)
                      .WithMany()
                      .HasForeignKey(a => a.hotelID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<QueryForm>(entity =>
            {
                entity.HasKey(e => e.queryID);
                entity.Property(e => e.fullName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Mobile).IsRequired().HasMaxLength(20);
            });

            // Master configuration - CORRECTED
            modelBuilder.Entity<Master>(entity =>
            {
                entity.ToTable("tbladvMaster");
                
                // String properties with length constraints
                entity.Property(e => e.billNo).HasMaxLength(50);
                entity.Property(e => e.Notes).HasMaxLength(500);
                entity.Property(e => e.agencyName).HasMaxLength(250);
                entity.Property(e => e.pID).HasMaxLength(10);
                entity.Property(e => e.caption).HasMaxLength(250);
                
                // Configure nullable properties (only for nullable types)
                entity.Property(e => e.billNo).IsRequired(false);
                entity.Property(e => e.billDate).IsRequired(false);
                entity.Property(e => e.roNo).IsRequired(false);
                entity.Property(e => e.roDate).IsRequired(false);
                entity.Property(e => e.Notes).IsRequired(false);
                entity.Property(e => e.clientID).IsRequired(false);
                entity.Property(e => e.agencyName).IsRequired(false);
                entity.Property(e => e.pID).IsRequired(false);
                entity.Property(e => e.caption).IsRequired(false);
                
                // REMOVED: Don't configure non-nullable int properties as optional
                // entity.Property(e => e.frontPageExtra).IsRequired(false); // REMOVE THIS
                // entity.Property(e => e.backPageExtra).IsRequired(false);  // REMOVE THIS
                // entity.Property(e => e.comission).IsRequired(false);      // REMOVE THIS
                
                entity.Property(e => e.createdBy).IsRequired(false);
                entity.Property(e => e.createdDT).IsRequired(false);
                entity.Property(e => e.modifyBy).IsRequired(false);
                entity.Property(e => e.modifyDT).IsRequired(false);

                // Set default values for non-nullable int properties
                entity.Property(e => e.frontPageExtra).HasDefaultValue(0);
                entity.Property(e => e.backPageExtra).HasDefaultValue(0);
                entity.Property(e => e.comission).HasDefaultValue(0);
            });

            // Detail configuration
            modelBuilder.Entity<Detail>(entity =>
            {
                entity.ToTable("tbladvDetail");
                
                // String properties with length constraints
                entity.Property(e => e.color).HasMaxLength(50);
                entity.Property(e => e.size).HasMaxLength(50);
                entity.Property(e => e.totalSpace).HasMaxLength(50);
                entity.Property(e => e.position).HasMaxLength(50);
                
                // Configure nullable properties
                entity.Property(e => e.inserationDate).IsRequired(false);
                entity.Property(e => e.color).IsRequired(false);
                entity.Property(e => e.size).IsRequired(false);
                entity.Property(e => e.totalSpace).IsRequired(false);
                entity.Property(e => e.position).IsRequired(false);
                
                // Set default value for rate
                entity.Property(e => e.rate).HasDefaultValue(0);
                
                // Relationship with Master
                entity.HasOne(d => d.Master)
                      .WithMany(m => m.Details)
                      .HasForeignKey(d => d.masterID)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}