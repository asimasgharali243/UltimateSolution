using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblPackage")]
    public class Package
    {
        [Key]
        public int packgeID { get; set; }

        [Required]
        [StringLength(250)]
        public string PackgeTitle { get; set; } = string.Empty;
        
        // Audit tracking properties
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