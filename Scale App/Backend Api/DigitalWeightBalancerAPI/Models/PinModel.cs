using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalWeightBalancerAPI.Models
{
    [Table("tbl_UserPin")]
    public class UserPin
    {
        [Key]
        public int PIN_ID { get; set; }
        public int User_ID { get; set; }
        public string? PIN { get; set; }
    }
}
