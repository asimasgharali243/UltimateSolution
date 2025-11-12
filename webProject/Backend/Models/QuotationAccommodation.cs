using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("quotation_accommodation")]
    public class QuotationAccommodation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        public int quotation_id { get; set; }

        [Required]
        public int cityID { get; set; }

        [Required]
        public int hotelID { get; set; }

        [Required]
        public DateTime check_in { get; set; }

        [Required]
        public DateTime check_out { get; set; }

        [Required]
        [StringLength(50)]
        public string room_type { get; set; } = "sharing";

        [Required]
        public int no_of_rooms { get; set; }

        [Required]
        public int no_of_nights { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal rate_per_night { get; set; }

        public DateTime created_at { get; set; } = DateTime.Now;

        public int createdBy { get; set; } = 1;

        public int? ModifyBy { get; set; }

        // Navigation properties
        [ForeignKey("quotation_id")]
        public virtual Quotation? Quotation { get; set; } = null!;

        [ForeignKey("cityID")]
        public virtual City? City { get; set; }

        [ForeignKey("hotelID")]
        public virtual Hotel? Hotel { get; set; }
    }
}