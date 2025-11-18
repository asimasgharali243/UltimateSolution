using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class PurchaseDetail
    {
        [Key]
        public int id { get; set; }
        
        public int masterID { get; set; }
        public int itemID { get; set; }
        
        [StringLength(250)]
        public string? itemRemarks { get; set; }
        
        // These are FLOAT in database
        public float qty { get; set; }
        public float price { get; set; }
        
        // Navigation properties
        [ForeignKey("masterID")]
        public virtual PurchaseMaster PurchaseMaster { get; set; }
        
        [ForeignKey("itemID")]
        public virtual Item Item { get; set; }
    }
}