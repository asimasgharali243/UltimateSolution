// Backend/Models/Master.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tbladvMaster")]
    public class Master
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("masterID")]
        public int masterID { get; set; }

        [Required]
        [Column("vNo")]
        public int vNo { get; set; }

        [StringLength(50)]
        [Column("billNo")]
        public string? billNo { get; set; }

        [Column("billDate")]
        public DateTime? billDate { get; set; }

        [StringLength(50)]
        [Column("roNo")]
        public string? roNo { get; set; }

        [Column("roDate")]
        public DateTime? roDate { get; set; }

        [StringLength(500)]
        [Column("Notes")]
        public string? Notes { get; set; }

        [Column("accountID")]
        public int? accountID { get; set; }

        [StringLength(250)]
        [Column("agencyName")]
        public string? agencyName { get; set; }

        [StringLength(10)]
        [Column("pID")]
        public string? pID { get; set; }

        [StringLength(250)]
        [Column("caption")]
        public string? caption { get; set; }

        [Required]
        [Column("frontPageExtra")]
        public int frontPageExtra { get; set; } = 0;

        [Required]
        [Column("backPageExtra")]
        public int backPageExtra { get; set; } = 0;

        [Required]
        [Column("comission")]
        public int comission { get; set; } = 0;

        [Column("createdBy")]
        public int? createdBy { get; set; }

        [Column("createdDT")]
        public DateTime? createdDT { get; set; } = DateTime.UtcNow;

        [Column("modifyBy")]
        public int? modifyBy { get; set; }

        [Column("modifyDT")]
        public DateTime? modifyDT { get; set; }

        // Navigation properties
        [ForeignKey("accountID")]
        public virtual Account? Account { get; set; }
        
        [ForeignKey("createdBy")]
        public virtual User? CreatedByUser { get; set; }
        
        [ForeignKey("modifyBy")]
        public virtual User? ModifiedByUser { get; set; }

        public virtual ICollection<Detail> Details { get; set; } = new List<Detail>();
    }

    [Table("tbladvDetail")]
    public class Detail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int id { get; set; }

        [Required]
        [Column("masterID")]
        public int masterID { get; set; }

        [Column("inserationDate")]
        public DateTime? inserationDate { get; set; }

        [StringLength(50)]
        [Column("color")]
        public string? color { get; set; }

        [StringLength(50)]
        [Column("size")]
        public string? size { get; set; }

        [StringLength(50)]
        [Column("totalSpace")]
        public string? totalSpace { get; set; }

        [StringLength(50)]
        [Column("position")]
        public string? position { get; set; }

        [Required]
        [Column("rate")]
        public int rate { get; set; }

        [ForeignKey("masterID")]
        public virtual Master Master { get; set; } = null!;
    }
}