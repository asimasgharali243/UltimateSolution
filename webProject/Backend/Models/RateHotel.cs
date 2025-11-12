using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblRateHotels")]
    public class RateHotel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        public int cityID { get; set; }

        [Required]
        public int hotelID { get; set; }

        [Required]
        [StringLength(250)]
        public string Locations { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string Distance { get; set; } = string.Empty;

        public int sharing { get; set; }
        public int quint { get; set; }
        public int quad { get; set; }
        public int triple { get; set; }
        public int doble { get; set; }

        // Navigation properties
        [ForeignKey("cityID")]
        public virtual City? City { get; set; }

        [ForeignKey("hotelID")]
        public virtual Hotel? Hotel { get; set; }
    }
}