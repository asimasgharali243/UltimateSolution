using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class PurchaseMasterDTO
    {
        public int masterID { get; set; }
        
        [Required]
        public int vNo { get; set; }
        
        [Required]
        public DateTime date { get; set; }
        
        [Required]
        public int accountID { get; set; }
        
        [StringLength(250)]
        public string? notes { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal totalAmount { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal totalQty { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal lessDiscount { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal addFreight { get; set; }
        
        [Required]
        [Range(0, double.MaxValue)]
        public decimal netTotal { get; set; }
        
        public List<PurchaseDetailDTO> PurchaseDetails { get; set; } = new List<PurchaseDetailDTO>();
        
        // For display
        public string? AccountName { get; set; }
        public string? CreatedByName { get; set; }
    }

    public class PurchaseDetailDTO
    {
        public int id { get; set; }
        
        [Required]
        public int masterID { get; set; }
        
        [Required]
        public int itemID { get; set; }
        
        [StringLength(250)]
        public string? itemRemarks { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal qty { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal price { get; set; }
        
        // For display
        public string? ItemName { get; set; }
        public string? ItemCode { get; set; }
        
        // Computed property
        public decimal total => qty * price;
    }

    public class CreatePurchaseRequest
    {
        [Required]
        public DateTime date { get; set; }
        
        [Required]
        public int accountID { get; set; }
        
        [StringLength(250)]
        public string? notes { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal lessDiscount { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal addFreight { get; set; }
        
        [Required]
        [MinLength(1, ErrorMessage = "At least one purchase detail is required")]
        public List<PurchaseDetailRequest> PurchaseDetails { get; set; } = new List<PurchaseDetailRequest>();
    }

    public class PurchaseDetailRequest
    {
        [Required]
        public int itemID { get; set; }
        
        [StringLength(250)]
        public string? itemRemarks { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
        public decimal qty { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal price { get; set; }
    }
}