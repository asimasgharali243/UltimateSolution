using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tbl_Level4")]
    public class Level4
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("ID")]
        public int ID { get; set; }

        [Column("LID3")]
        public int LID3 { get; set; }

        [Required]
        [StringLength(50)]
        [Column("LID4")]
        public string LID4 { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [Column("Titlle4")]
        public string Title4 { get; set; } = string.Empty;

        [ForeignKey("LID3")]
        public virtual Level3? Level3 { get; set; }
    }
}