
// DTOs/RegisterRequest.cs
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string? UserName { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string? Password { get; set; }

        [Required]
        [StringLength(100)]
        public string? UserFullName { get; set; }

        public string? UserImage { get; set; }
    }
}