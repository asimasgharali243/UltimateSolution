// Backend/DTOs/HotelDto.cs
namespace Backend.DTOs
{
    public class HotelDto
    {
        public int hotelID { get; set; }
        public string hotelName { get; set; } = string.Empty;
        public string hotalType { get; set; } = string.Empty;
        public int cityID { get; set; }
        public string CityName { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedDT { get; set; }
        public int? ModifyBy { get; set; }
        public string ModifiedByName { get; set; } = string.Empty;
        public DateTime? ModifyDT { get; set; }
    }
}