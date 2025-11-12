using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("quotation_transportation")]
    public class QuotationTransportation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        public int quotation_id { get; set; }

        [Required]
        [StringLength(255)]
        public string vehicle_name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string capacity { get; set; } = string.Empty;

        [Required]
        public int sectorID { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal rate { get; set; }

        [Required]
        public int quantity { get; set; }

        public DateTime created_at { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("quotation_id")]
        public virtual Quotation? Quotation { get; set; } = null!;

        [ForeignKey("sectorID")]
        public virtual Sector? Sector { get; set; } = null!;
    }
}