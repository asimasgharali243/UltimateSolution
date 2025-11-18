// Backend/DTOs/ItemGroupDto.cs
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class ItemGroupCreateDto
    {
        [Required]
        [StringLength(50)]
        public string GroupCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string GroupName { get; set; } = string.Empty;

        public bool Active { get; set; } = true;

        [Required]
        public int CreatedBy { get; set; }
    }

    public class ItemGroupUpdateDto
    {
        [Required]
        [StringLength(50)]
        public string GroupCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string GroupName { get; set; } = string.Empty;

        public bool Active { get; set; } = true;

        [Required]
        public int ModifyBy { get; set; }
    }

    public class ItemGroupResponseDto
    {
        public int GroupID { get; set; }
        public string GroupCode { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public bool Active { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDT { get; set; }
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }
        
        // User details
        public string? CreatedByName { get; set; }
        public string? ModifiedByName { get; set; }
    }
}