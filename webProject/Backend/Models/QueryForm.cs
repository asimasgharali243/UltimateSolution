using System;
using System.ComponentModel.DataAnnotations; // Add this
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblQueryForm")]
    public class QueryForm
    {
        [Key]
        public int queryID { get; set; }
        
        [Required]
        [StringLength(255)]
        public string fullName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(20)]
        public string Mobile { get; set; } = string.Empty;
        
        [StringLength(20)]
        public string? WhatsApp { get; set; }
        
        [StringLength(255)]
        [EmailAddress]
        public string? email { get; set; }
        
        [StringLength(255)]
        public string? groupHeadName { get; set; }
        
        [StringLength(20)]
        public string? groupHeadMobile { get; set; }
        
        [StringLength(20)]
        public string? groupHeadWhatsapp { get; set; }
        
        [StringLength(255)]
        [EmailAddress]
        public string? groupHeadEmail { get; set; }
        
        [StringLength(255)]
        public string? Route { get; set; }
        
        [StringLength(255)]
        public string? Airline { get; set; }
        
        public int? Adjults { get; set; }
        
        public int? Child { get; set; }
        
        [StringLength(255)]
        public string? CityResidance { get; set; }
        
        [StringLength(255)]
        public string? CityDeparture { get; set; }
        
        public DateTime? DateDeparture { get; set; }
        
        public DateTime? DateArrival { get; set; }
        
        [StringLength(100)]
        public string? hotelCategory { get; set; }
        
        [StringLength(100)]
        public string? RoomType { get; set; }
        
        public int? DaysMakkah { get; set; }
        
        public int? DaysMadina { get; set; }
        
        public int CreatedBy { get; set; } = 1;
        
        public DateTime CreatedDT { get; set; } = DateTime.Now;
        
        public int? ModifyBy { get; set; }
        
        public DateTime? ModifyDT { get; set; }
    }
}