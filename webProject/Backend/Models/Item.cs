using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblItem")]
    public class Item
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("itemID")]
        public int ItemID { get; set; }

        [Required]
        [StringLength(50)]
        [Column("itemCode")]
        public string ItemCode { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        [Column("itemName")]
        public string ItemName { get; set; } = string.Empty;

        [Column("groupID")]
        public int? GroupID { get; set; }

        [Column("categoryID")]
        public int? CategoryID { get; set; }

        [Column("pRate")]
        public double? PRate { get; set; }

        [Column("sRate")]
        public double? SRate { get; set; }

        [Column("MinLevel")]
        public int? MinLevel { get; set; }

        [Column("createdBy")]
        public int? CreatedBy { get; set; }

        [Column("createdDT")]
        public DateTime? CreatedDT { get; set; } = DateTime.UtcNow;

        [Column("modifyBy")]
        public int? ModifyBy { get; set; }

        [Column("modifyDT")]
        public DateTime? ModifyDT { get; set; }

        [Column("date")]
        public DateTime? Date { get; set; }

        [Column("openingQuantity")]
        public int? OpeningQuantity { get; set; }

        [Column("openingRate")]
        public int? OpeningRate { get; set; }

        [Column("lowStockLevel")]
        public int? LowStockLevel { get; set; }

        [Column("stockAssetAcountID")]
        public int? StockAssetAccountID { get; set; }

        [Column("incomeAccountID")]
        public int? IncomeAccountID { get; set; }

        [Column("expenseAccountID")]
        public int? ExpenseAccountID { get; set; }

        [Column("unitID")]
        public int? UnitID { get; set; }

        [StringLength(250)]
        [Column("Notes")]
        public string? Notes { get; set; }

        // Remove these properties as they don't exist in your database
        // public decimal? SaleDiscount { get; set; }
        // public string? GSTRate { get; set; }
        // public string? BinLocation { get; set; }
        // public string? NonFilerGSTRate { get; set; }
        // public int? LargePackSize { get; set; }
        // public bool? Scaled { get; set; }
        // public bool? MPExTax { get; set; }
        // public int? SmallPackSize { get; set; }
        // public int? PreferredSupplier { get; set; }

        [ForeignKey("GroupID")]
        public virtual ItemGroup? ItemGroup { get; set; }

        [ForeignKey("CategoryID")]
        public virtual ItemCategory? ItemCategory { get; set; }

        [ForeignKey("UnitID")]
        public virtual ItemUnit? ItemUnit { get; set; }

        [ForeignKey("StockAssetAccountID")]
        public virtual Level4? StockAssetAccount { get; set; }

        [ForeignKey("IncomeAccountID")]
        public virtual Level4? IncomeAccount { get; set; }

        [ForeignKey("ExpenseAccountID")]
        public virtual Level4? ExpenseAccount { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}