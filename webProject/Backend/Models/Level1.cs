using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tbl_Level1")]
    public class Level1
    {
        [Key]
        [Column("LID1")]
        public int LID1 { get; set; }

        [Required]
        [StringLength(50)]
        [Column("Title1")]
        public string Title1 { get; set; } = string.Empty;
    }
}