using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Add this line

namespace Backend.Models
{
    [Table("tblUser")] // This will now work
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [StringLength(50)]
        public string? UserName { get; set; }

        [Required]
        public string? UserPassword { get; set; }

        [Required]
        [StringLength(100)]
        public string? UserFullName { get; set; }

        public string? UserImage { get; set; }

        public bool Active { get; set; } = true;

        public DateTime? LastLoginDT { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}