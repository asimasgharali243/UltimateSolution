using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class QueryFormDto
    {
        public int queryID { get; set; }
        
        [Required(ErrorMessage = "Full Name is required")]
        [StringLength(255, ErrorMessage = "Full Name cannot exceed 255 characters")]
        public string fullName { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Mobile number is required")]
        [StringLength(20, ErrorMessage = "Mobile number cannot exceed 20 characters")]
        [RegularExpression(@"^\+?[0-9]\d{1,14}$", ErrorMessage = "Invalid phone number format")]
        public string Mobile { get; set; } = string.Empty;
        
        [StringLength(20, ErrorMessage = "WhatsApp number cannot exceed 20 characters")]
        [CustomValidation(typeof(QueryFormDto), nameof(ValidatePhoneNumber))]
        public string? WhatsApp { get; set; }
        
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        public string? email { get; set; }
        
        [StringLength(255, ErrorMessage = "Group head name cannot exceed 255 characters")]
        public string? groupHeadName { get; set; }
        
        [StringLength(20, ErrorMessage = "Group head mobile cannot exceed 20 characters")]
        [CustomValidation(typeof(QueryFormDto), nameof(ValidatePhoneNumber))]
        public string? groupHeadMobile { get; set; }
        
        [StringLength(20, ErrorMessage = "Group head WhatsApp cannot exceed 20 characters")]
        [CustomValidation(typeof(QueryFormDto), nameof(ValidatePhoneNumber))]
        public string? groupHeadWhatsapp { get; set; }
        
        [StringLength(255, ErrorMessage = "Group head email cannot exceed 255 characters")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        public string? groupHeadEmail { get; set; }
        
        [StringLength(255, ErrorMessage = "Route cannot exceed 255 characters")]
        public string? Route { get; set; }
        
        [StringLength(255, ErrorMessage = "Airline cannot exceed 255 characters")]
        public string? Airline { get; set; }
        
        [Range(0, 1000, ErrorMessage = "Adults count must be between 0 and 1000")]
        public int? Adjults { get; set; }
        
        [Range(0, 1000, ErrorMessage = "Children count must be between 0 and 1000")]
        public int? Child { get; set; }
        
        [StringLength(255, ErrorMessage = "City of residence cannot exceed 255 characters")]
        public string? CityResidance { get; set; }
        
        [StringLength(255, ErrorMessage = "City of departure cannot exceed 255 characters")]
        public string? CityDeparture { get; set; }
        
        public DateTime? DateDeparture { get; set; }
        
        public DateTime? DateArrival { get; set; }
        
        [StringLength(100, ErrorMessage = "Hotel category cannot exceed 100 characters")]
        public string? hotelCategory { get; set; }
        
        [StringLength(100, ErrorMessage = "Room type cannot exceed 100 characters")]
        public string? RoomType { get; set; }
        
        [Range(0, 365, ErrorMessage = "Days in Makkah must be between 0 and 365")]
        public int? DaysMakkah { get; set; }
        
        [Range(0, 365, ErrorMessage = "Days in Madina must be between 0 and 365")]
        public int? DaysMadina { get; set; }
        
        public int CreatedBy { get; set; } = 1;
        
        public DateTime CreatedDT { get; set; } = DateTime.Now;
        
        public int? ModifyBy { get; set; }
        
        public DateTime? ModifyDT { get; set; }

        public static ValidationResult? ValidatePhoneNumber(string? phone, ValidationContext context)
        {
            if (string.IsNullOrEmpty(phone))
                return ValidationResult.Success;

            if (!System.Text.RegularExpressions.Regex.IsMatch(phone, @"^\+?[0-9]\d{1,14}$"))
                return new ValidationResult("Invalid phone number format");

            return ValidationResult.Success;
        }
    }
}