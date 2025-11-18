using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblItemUnit")]
    public class ItemUnit
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("unitID")]
        public int UnitID { get; set; }

        [Required]
        [StringLength(50)]
        [Column("unitName")]
        public string UnitName { get; set; } = string.Empty;

        [Column("createdBy")]
        public int? CreatedBy { get; set; }

        [Column("createdDT")]
        public DateTime? CreatedDT { get; set; } = DateTime.UtcNow;

        [Column("modifyBy")]
        public int? ModifyBy { get; set; }

        [Column("modifyDT")]
        public DateTime? ModifyDT { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}