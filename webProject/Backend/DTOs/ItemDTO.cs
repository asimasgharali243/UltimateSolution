using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
       public class ItemCreateDTO
    {
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int? GroupID { get; set; }
        public int? CategoryID { get; set; }
        public double? PRate { get; set; }
        public double? SRate { get; set; }
        public int? MinLevel { get; set; }
        public DateTime? Date { get; set; }
        public int? OpeningQuantity { get; set; }
        public int? OpeningRate { get; set; }
        public int? LowStockLevel { get; set; }
        public int? StockAssetAccountID { get; set; }
        public int? IncomeAccountID { get; set; }
        public int? ExpenseAccountID { get; set; }
        public int? UnitID { get; set; }
        public string? Notes { get; set; }
        public int? CreatedBy { get; set; }
    }

   public class ItemUpdateDTO
    {
        public int ItemID { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int? GroupID { get; set; }
        public int? CategoryID { get; set; }
        public double? PRate { get; set; }
        public double? SRate { get; set; }
        public int? MinLevel { get; set; }
        public DateTime? Date { get; set; }
        public int? OpeningQuantity { get; set; }
        public int? OpeningRate { get; set; }
        public int? LowStockLevel { get; set; }
        public int? StockAssetAccountID { get; set; }
        public int? IncomeAccountID { get; set; }
        public int? ExpenseAccountID { get; set; }
        public int? UnitID { get; set; }
        public string? Notes { get; set; }
        public int? ModifyBy { get; set; }
    }

      public class ItemResponseDTO
    {
        public int ItemID { get; set; }
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int? GroupID { get; set; }
        public string? GroupName { get; set; }
        public int? CategoryID { get; set; }
        public string? CategoryName { get; set; }
        public double? PRate { get; set; }
        public double? SRate { get; set; }
        public int? MinLevel { get; set; }
        public DateTime? Date { get; set; }
        public int? OpeningQuantity { get; set; }
        public int? OpeningRate { get; set; }
        public int? LowStockLevel { get; set; }
        public int? StockAssetAccountID { get; set; }
        public string? StockAssetAccountName { get; set; }
        public int? IncomeAccountID { get; set; }
        public string? IncomeAccountName { get; set; }
        public int? ExpenseAccountID { get; set; }
        public string? ExpenseAccountName { get; set; }
        public int? UnitID { get; set; }
        public string? UnitName { get; set; }
        public string? Notes { get; set; }
    }

    public class DropdownDTO
    {
        public int Value { get; set; }
        public string Label { get; set; } = string.Empty;
    }
}