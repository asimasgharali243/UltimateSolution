using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("quotation_visaService")]
    public class QuotationVisaService
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        public int quotation_id { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Rate { get; set; }

        [Required]
        public int Qty { get; set; }

        // Navigation property
        [ForeignKey("quotation_id")]
        public virtual Quotation? Quotation { get; set; } = null!;
    }
}