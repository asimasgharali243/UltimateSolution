using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblaccount")]
    public class Account
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("accountID")]
        public int accountID { get; set; }

        [StringLength(50)]
        [Column("accountType")]
        public string? accountType { get; set; }

        [Required]
        [StringLength(250)]
        [Column("accountTitle")]
        public string accountTitle { get; set; } = string.Empty;

        [StringLength(50)]
        [Column("city")]
        public string? city { get; set; }

        [StringLength(250)]
        [Column("address")]
        public string? address { get; set; }

        [StringLength(50)]
        [Column("title")]
        public string? title { get; set; }

        [StringLength(250)]
        [Column("contactPersonName")]
        public string? contactPersonName { get; set; }

        [StringLength(50)]
        [Column("contactPersonMobile")]
        public string? contactPersonMobile { get; set; }

        [StringLength(50)]
        [Column("contactPersonWhatsapp")]
        public string? contactPersonWhatsapp { get; set; }

        [StringLength(50)]
        [Column("contactPersonEmail")]
        public string? contactPersonEmail { get; set; }

        [Column("creditLimit")]
        public int creditLimit { get; set; } = 0;

        [Column("creditDays")]
        public int creditDays { get; set; } = 0;

        [StringLength(50)]
        [Column("cnic")]
        public string? cnic { get; set; }

        [StringLength(50)]
        [Column("ntn")]
        public string? ntn { get; set; }

        [StringLength(50)]
        [Column("stn")]
        public string? stn { get; set; }

        [Column("openingBalance")]
        public int openingBalance { get; set; } = 0;

        [StringLength(500)]
        [Column("notes")]
        public string? notes { get; set; }

        [Column("openingBalanceDate")]
        public DateTime? openingBalanceDate { get; set; }

        [Column("createdBy")]
        public int? createdBy { get; set; }

        [Column("createdDT")]
        public DateTime? createdDT { get; set; }

        [Column("modifyBy")]
        public int? modifyBy { get; set; }

        [Column("modifyDT")]
        public DateTime? modifyDT { get; set; }

        [Column("LID4")]
        public int? LID4 { get; set; }

        // Navigation properties
        [ForeignKey("createdBy")]
        public virtual User? CreatedByUser { get; set; }

        [ForeignKey("modifyBy")]
        public virtual User? ModifiedByUser { get; set; }
    }
}