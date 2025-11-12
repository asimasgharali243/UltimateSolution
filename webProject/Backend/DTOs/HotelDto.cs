namespace Backend.DTOs
{
    public class HotelDto
    {
        public int hotelID { get; set; }
        public string hotelName { get; set; } = string.Empty;
        public string hotalType { get; set; } = string.Empty;
        public int cityID { get; set; }
        public string? CityName { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDT { get; set; }
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }
    }
}