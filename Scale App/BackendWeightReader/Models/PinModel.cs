using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendWeightReader.Models
{
    [Table("tbl_UserPin")]
    public class UserPin
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PIN_ID { get; set; }

        [StringLength(10)]
        public string PIN { get; set; }
    }
}
