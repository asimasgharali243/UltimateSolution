using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.DTOs
{
    public class QuotationDto
    {
        // public int id { get; set; }
        
        [Required]
        public int client_id { get; set; }
        
        public string traveling_details { get; set; } = string.Empty;
        
        public int packgeID { get; set; }
        
        public string? reference_by { get; set; }
        
        [Required]
        public int makkah_nights { get; set; }
        
        [Required]
        public int madinah_nights { get; set; }
        
        public int? makkah_nights1 { get; set; }
        
        public int? jeddah_nights { get; set; }
        
        public int? adult_count { get; set; }
        
        public int? child_count { get; set; }
        
        public int? infant_count { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? advance_amount { get; set; }
        
        public string? status { get; set; } = "Draft";
        
        public int createdBy { get; set; } = 1;
        
        public int? modifyBy { get; set; }
        public int? queryID { get; set; }
        
        public List<AccommodationDto> Accommodations { get; set; } = new List<AccommodationDto>();
        public List<TransportationDto> Transportations { get; set; } = new List<TransportationDto>();
        public List<VisaServiceDto> VisaServices { get; set; } = new List<VisaServiceDto>();
        public List<AirlineDto> Airlines { get; set; } = new List<AirlineDto>();
    }

    public class AccommodationDto
    {
        public int cityID { get; set; }
        public int hotelID { get; set; }
        public DateTime check_in { get; set; }
        public DateTime check_out { get; set; }
        public string room_type { get; set; } = "sharing";
        public int no_of_rooms { get; set; }
        public int no_of_nights { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal rate_per_night { get; set; }
    }

    public class TransportationDto
    {
        public string vehicle_name { get; set; } = string.Empty;
        public string capacity { get; set; } = string.Empty;
        public int sectorID { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal rate { get; set; }
        public int quantity { get; set; }
    }

    public class VisaServiceDto
    {
        public string Description { get; set; } = string.Empty;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Rate { get; set; }
        public int Qty { get; set; }
    }

    public class AirlineDto
    {
        public string carrier { get; set; } = string.Empty;
        public int pax_count { get; set; }
        public string @class { get; set; } = "Economy";
        public string sector { get; set; } = string.Empty;
        [Column(TypeName = "decimal(18,2)")]
        public decimal rate { get; set; }
        public int quantity { get; set; }
    }
}