using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("quotation_airlines")]
    public class QuotationAirlines
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        public int quotation_id { get; set; }

        [Required]
        [StringLength(255)]
        public string carrier { get; set; } = string.Empty;

        [Required]
        public int pax_count { get; set; }

        [Required]
        [StringLength(50)]
        public string @class { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string sector { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal rate { get; set; }

        [Required]
        public int quantity { get; set; }

        public DateTime created_at { get; set; } = DateTime.Now;

        // Navigation property
        [ForeignKey("quotation_id")]
        public virtual Quotation? Quotation { get; set; } = null!;
    }
}