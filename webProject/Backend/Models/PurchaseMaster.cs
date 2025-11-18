using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class PurchaseMaster
    {
        [Key]
        public int masterID { get; set; }
        
        public int vNo { get; set; }
        
        public DateTime date { get; set; }
        
        public int accountID { get; set; }
        
        [StringLength(250)]
        public string? notes { get; set; }
        
        // These are INT in database - we'll store as cents
        public int totalAmount { get; set; }
        public int totalQty { get; set; }
        public int lessDiscount { get; set; }
        public int addFreight { get; set; }
        public int netTotal { get; set; }
        
        public int createdBy { get; set; }
        public DateTime createdDT { get; set; }
        public int? modifyBy { get; set; }
        public DateTime? modifyDT { get; set; }
        
        // Navigation properties
        [ForeignKey("accountID")]
        public virtual Account Account { get; set; }
        
        public virtual ICollection<PurchaseDetail> PurchaseDetails { get; set; } = new List<PurchaseDetail>();
    }
}