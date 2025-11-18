using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tbl_Level3")]
    public class Level3
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ID")]
        public int ID { get; set; }

        [Column("LID2")]
        public int LID2 { get; set; }

        [Required]
        [StringLength(50)]
        [Column("LID3")]
        public string LID3 { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [Column("Title3")]
        public string Title3 { get; set; } = string.Empty;

        [ForeignKey("LID2")]
        public virtual Level2? Level2 { get; set; }
    }
}