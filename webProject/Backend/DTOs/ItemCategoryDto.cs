using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class ItemCategoryCreateDto
    {
        [Required]
        [StringLength(50)]
        public string CategoryCode { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        public int GroupID { get; set; }

        [Required]
        public int CreatedBy { get; set; }
    }

    public class ItemCategoryUpdateDto
    {
        [Required]
        [StringLength(50)]
        public string CategoryCode { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        public int GroupID { get; set; }

        [Required]
        public int ModifyBy { get; set; }
    }

    public class ItemCategoryResponseDto
    {
        public int CategoryID { get; set; }
        public string CategoryCode { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int? GroupID { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDT { get; set; }
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }
        
        // Item Group details
        public string? GroupCode { get; set; }
        public string? GroupName { get; set; }
        public bool? GroupActive { get; set; }
        
        // User details
        public string? CreatedByName { get; set; }
        public string? ModifiedByName { get; set; }
    }

    // Use this DTO for check-code response
    public class CheckCodeResponseDto
    {
        public bool exists { get; set; }
        public string message { get; set; } = string.Empty;
    }
}