using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tbl_Level2")]
    public class Level2
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ID")]
        public int ID { get; set; }

        [Column("LID1")]
        public int LID1 { get; set; }

        [Required]
        [StringLength(50)]
        [Column("LID2")]
        public string LID2 { get; set; } = string.Empty;

        [Column("Title2")]
        public string Title2 { get; set; } = string.Empty;

        [ForeignKey("LID1")]
        public virtual Level1? Level1 { get; set; }
    }
}