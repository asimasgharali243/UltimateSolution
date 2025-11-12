namespace Backend.DTOs
{
    public class CityDto
    {
        public int cityID { get; set; }
        public string cityName { get; set; } = string.Empty;
        public int CreatedBy { get; set; }
        public DateTime CreatedDT { get; set; }
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }
    }
}