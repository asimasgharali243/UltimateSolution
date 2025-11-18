// Backend/Models/Sector.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblSector")]
    public class Sector
    {
        [Key]
        public int sectorID { get; set; }

        [Required]
        [StringLength(250)]
        public string sectorName { get; set; } = string.Empty;

        public bool Active { get; set; } = true;
        
        public DateTime CreatedDT { get; set; } = DateTime.Now;
        
        public int? CreatedBy { get; set; } = 1; // Default to user 1
        
        public DateTime? ModifyDT { get; set; }
        public int? ModifyBy { get; set; }

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}