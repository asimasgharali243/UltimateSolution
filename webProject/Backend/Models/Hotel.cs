// Backend/Models/Hotel.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblHotel")]
    public class Hotel
    {
        [Key]
        public int hotelID{ get; set; }

        [Required]
        [StringLength(250)]
        public string hotelName { get; set; } = string.Empty;
        
        public string hotalType { get; set; } = string.Empty;
        public int cityID{ get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDT { get; set; } = DateTime.Now;
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }

        // Navigation property
        [ForeignKey("cityID")]
        public virtual City? City { get; set; }
    }
}