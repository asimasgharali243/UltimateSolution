// Backend/Models/ItemGroup.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblItemGroup")]
    public class ItemGroup
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("groupID")]
        public int GroupID { get; set; }

        [Required]
        [StringLength(50)]
        [Column("groupCode")]
        public string GroupCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        [Column("groupName")]
        public string GroupName { get; set; } = string.Empty;

        [Column("Active")]
        public bool Active { get; set; } = true;

        [Column("createdBy")]
        public int? CreatedBy { get; set; }

        [Column("createdDT")]
        public DateTime? CreatedDT { get; set; } = DateTime.UtcNow;

        [Column("modifyBy")]
        public int? ModifyBy { get; set; }

        [Column("modifyDT")]
        public DateTime? ModifyDT { get; set; }

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}