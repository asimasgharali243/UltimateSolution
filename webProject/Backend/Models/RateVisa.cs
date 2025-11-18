using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblRateVisa")]
    public class RateVisa
    {
        [Key]
        public int id { get; set; }

        public int? paxid { get; set; }
        public int? rate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDT { get; set; }
        public int? ModifyBy { get; set; }
        public DateTime? ModifyDT { get; set; }

        // Navigation properties
        [ForeignKey("paxid")]
        public virtual Pax? Pax { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("ModifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}