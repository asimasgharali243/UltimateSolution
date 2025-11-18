using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblPax")]
    public class Pax
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int paxID { get; set; }

        [Required]
        [StringLength(250)]
        public string? paxTitle { get; set; } = string.Empty;

        public int? CreatedBy { get; set; }
        public DateTime? CreatedDT { get; set; }
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}