using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsumerWebAPI.Models
{
    [Table("tbl_User")]
    public class User
    {
        [Key]
        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
        public int ConsumerID { get; set; }
    }
}
