using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("quotations")]
    public class Quotation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        public int client_id { get; set; }

        [StringLength(100)]
        public string? quotation_number { get; set; } = string.Empty;

        [StringLength(500)]
        public string traveling_details { get; set; } = string.Empty;

        public int? packgeID { get; set; }

        [StringLength(255)]
        public string? reference_by { get; set; }

        [Required]
        public int makkah_nights { get; set; }

        [Required]
        public int madinah_nights { get; set; }

        public int? makkah_nights1 { get; set; }

        public int? jeddah_nights { get; set; }

        public int? total_stay_days { get; set; }

        public int? adult_count { get; set; }

        public int? child_count { get; set; }

        public int? infant_count { get; set; }

        public int? total_pax { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? total_package_cost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? advance_amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? grand_total { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? cost_per_person { get; set; }

        [StringLength(50)]
        public string? status { get; set; } = "Draft";

        public DateTime created_at { get; set; } = DateTime.Now;

        public DateTime? updated_at { get; set; }

        public int createdBy { get; set; } = 1;

        public int? modifyBy { get; set; }

        public int? queryID { get; set; }

        // Navigation properties
        [ForeignKey("client_id")]
        public virtual Client? Client { get; set; }

        public virtual ICollection<QuotationAccommodation> Accommodations { get; set; } = new List<QuotationAccommodation>();
        public virtual ICollection<QuotationTransportation> Transportations { get; set; } = new List<QuotationTransportation>();
        public virtual ICollection<QuotationVisaService> VisaServices { get; set; } = new List<QuotationVisaService>();
        public virtual ICollection<QuotationAirlines> Airlines { get; set; } = new List<QuotationAirlines>();
    }
}