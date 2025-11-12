using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalWeightBalancerAPI.Models
{
    [Table("tbl_User")]
    public class User
    {
        [Key]
        public int User_ID { get; set; }

        public string? UserName { get; set; }
        public string? Password { get; set; }
    }
}
