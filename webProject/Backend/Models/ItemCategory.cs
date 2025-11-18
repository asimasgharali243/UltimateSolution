using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblItemCategory")]
    public class ItemCategory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("categoryID")]
        public int CategoryID { get; set; }

        [Required]
        [StringLength(50)]
        [Column("categoryCode")]
        public string CategoryCode { get; set; } = string.Empty;

        [Required]
        [StringLength(250)]
        [Column("categoryName")]
        public string CategoryName { get; set; } = string.Empty;

        [Column("groupID")]
        public int? GroupID { get; set; }

        [Column("createdBy")]
        public int? CreatedBy { get; set; }

        [Column("createdDT")]
        public DateTime? CreatedDT { get; set; } = DateTime.UtcNow;

        [Column("modifyBy")]
        public int? ModifyBy { get; set; }

        [Column("modifyDT")]
        public DateTime? ModifyDT { get; set; }

        // Navigation properties
        [ForeignKey("GroupID")]
        public virtual ItemGroup? ItemGroup { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}