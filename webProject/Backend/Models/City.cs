using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblCity")]
    public class City
    {
        [Key]
        public int cityID { get; set; }

        [Required]
        [StringLength(150)]
        public string cityName { get; set; } = string.Empty;

        public int CreatedBy { get; set; }
        public DateTime CreatedDT { get; set; } = DateTime.Now;
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }

        public virtual ICollection<Hotel>? Hotels { get; set; }
        public virtual ICollection<RateHotel>? RateHotels { get; set; }
    }
}