// DTOs/UserResponse.cs
using System.ComponentModel.DataAnnotations;
namespace Backend.DTOs
{
    public class UserResponse
    {
        public int UserID { get; set; }
        public string? UserName { get; set; }
        public string? UserFullName { get; set; }
        public string? UserImage { get; set; }
        public DateTime? LastLoginDT { get; set; }
    }
}