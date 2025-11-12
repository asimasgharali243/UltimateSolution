using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendWeightReader.Models
{
    [Table("tblScale")]
    public class Scale
    {
        [Key]
        public long Id { get; set; }

        public int? ItemID { get; set; }

        [MaxLength(50)]
        public string? ItemCode { get; set; }

        [MaxLength(500)]
        public string? ItemName { get; set; }

        [MaxLength(500)]
        public string? ItemNameUrdu { get; set; }

        [Column(TypeName = "decimal(18,3)")]
        public decimal? scaleWeight { get; set; }

        public int? Qty { get; set; }

        [Column(TypeName = "nvarchar(max)")] // Make sure base64 fits
        public string? scaleImage { get; set; }

        public DateTime? scaleProcessDT { get; set; }

        public DateTime? SyncDT { get; set; }

        public int? SyncUserID { get; set; }

        public int? BatchID { get; set; }

        [MaxLength(50)]
        public string? BatchNo { get; set; }

        public bool? IsActive { get; set; }

        public int? InputToken { get; set; }

        public int? OutToken { get; set; }

        public int? total_token { get; set; }

        [MaxLength(50)]
        public string? scaleType { get; set; }
    }
}
