// DTOs/LoginRequest.cs
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class LoginRequest
    {
        [Required]
        public string? UserName { get; set; }

        [Required]
        public string? Password { get; set; }
    }
}