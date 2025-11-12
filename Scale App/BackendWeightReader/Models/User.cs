using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendWeightReader.Models
{
    [Table("tbl_User")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int User_ID { get; set; }

        [StringLength(50)]
        public string UserName { get; set; }

        [StringLength(250)]
        public string? UserNameUrdu { get; set; }

        [StringLength(250)]
        public string Password { get; set; }

        [StringLength(250)]
        public string? User_Img { get; set; }

        [StringLength(250)]
        public string? User_Signature { get; set; }

        [StringLength(20)]
        public string? PhoneNo { get; set; }

        public bool? IsEmployee { get; set; }
        public bool? IsSaleMan { get; set; }
        public bool? IsLogin { get; set; }

        public int? Emp_ID { get; set; }
        public int? LID4 { get; set; }

        [StringLength(8)]
        public string? OTP { get; set; }

        [StringLength(20)]
        public string? isp_IP { get; set; }

        [StringLength(20)]
        public string? Computer_ID { get; set; }

        public bool? Active { get; set; }

        public int? Created_By { get; set; }

        public DateTime? Creation_DateTime { get; set; }

        public int? Fiscal_Year { get; set; }

        [StringLength(4)]
        public string? SecurityCode { get; set; }

        public bool? OTPActive { get; set; }

        [StringLength(50)]
        public string? UserRole { get; set; }

        [StringLength(50)]
        public string? UserEmail { get; set; }

        [StringLength(50)]
        public string? OTPMedia { get; set; }
    }
}
