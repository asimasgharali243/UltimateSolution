using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class AccountCreateDto
    {
        [StringLength(50)]
        public string? accountType { get; set; }

        [Required(ErrorMessage = "Account title is required")]
        [StringLength(250, ErrorMessage = "Account title cannot exceed 250 characters")]
        public string accountTitle { get; set; } = string.Empty;

        [StringLength(50)]
        public string? city { get; set; }

        [StringLength(250)]
        public string? address { get; set; }

        [StringLength(50)]
        public string? title { get; set; }

        [StringLength(250)]
        public string? contactPersonName { get; set; }

        [StringLength(50)]
        public string? contactPersonMobile { get; set; }

        [StringLength(50)]
        public string? contactPersonWhatsapp { get; set; }

        [StringLength(50)]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? contactPersonEmail { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Credit limit must be a positive number")]
        public int creditLimit { get; set; } = 0;

        [Range(0, int.MaxValue, ErrorMessage = "Credit days must be a positive number")]
        public int creditDays { get; set; } = 0;

        [StringLength(50)]
        public string? cnic { get; set; }

        [StringLength(50)]
        public string? ntn { get; set; }

        [StringLength(50)]
        public string? stn { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Opening balance must be a positive number")]
        public int openingBalance { get; set; } = 0;

        [StringLength(500)]
        public string? notes { get; set; }

        public DateTime? openingBalanceDate { get; set; }

        [Required(ErrorMessage = "Created by user ID is required")]
        public int createdBy { get; set; }

        public int? LID4 { get; set; }
    }

    public class AccountUpdateDto
    {
        [StringLength(50)]
        public string? accountType { get; set; }

        [Required(ErrorMessage = "Account title is required")]
        [StringLength(250, ErrorMessage = "Account title cannot exceed 250 characters")]
        public string accountTitle { get; set; } = string.Empty;

        [StringLength(50)]
        public string? city { get; set; }

        [StringLength(250)]
        public string? address { get; set; }

        [StringLength(50)]
        public string? title { get; set; }

        [StringLength(250)]
        public string? contactPersonName { get; set; }

        [StringLength(50)]
        public string? contactPersonMobile { get; set; }

        [StringLength(50)]
        public string? contactPersonWhatsapp { get; set; }

        [StringLength(50)]
        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string? contactPersonEmail { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Credit limit must be a positive number")]
        public int creditLimit { get; set; } = 0;

        [Range(0, int.MaxValue, ErrorMessage = "Credit days must be a positive number")]
        public int creditDays { get; set; } = 0;

        [StringLength(50)]
        public string? cnic { get; set; }

        [StringLength(50)]
        public string? ntn { get; set; }

        [StringLength(50)]
        public string? stn { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Opening balance must be a positive number")]
        public int openingBalance { get; set; } = 0;

        [StringLength(500)]
        public string? notes { get; set; }

        public DateTime? openingBalanceDate { get; set; }

        [Required(ErrorMessage = "Modified by user ID is required")]
        public int modifyBy { get; set; }

        public int? LID4 { get; set; }
    }

    public class AccountResponseDto
    {
        public int accountID { get; set; }
        public string? accountType { get; set; }
        public string accountTitle { get; set; } = string.Empty;
        public string? city { get; set; }
        public string? address { get; set; }
        public string? title { get; set; }
        public string? contactPersonName { get; set; }
        public string? contactPersonMobile { get; set; }
        public string? contactPersonWhatsapp { get; set; }
        public string? contactPersonEmail { get; set; }
        public int creditLimit { get; set; }
        public int creditDays { get; set; }
        public string? cnic { get; set; }
        public string? ntn { get; set; }
        public string? stn { get; set; }
        public int openingBalance { get; set; }
        public string? notes { get; set; }
        public DateTime? openingBalanceDate { get; set; }
        public int? createdBy { get; set; }
        public DateTime? createdDT { get; set; }
        public int? modifyBy { get; set; }
        public DateTime? modifyDT { get; set; }
        public int? LID4 { get; set; }

        // User details
        public string? CreatedByUserName { get; set; }
        public string? CreatedByUserFullName { get; set; }
        public string? ModifiedByUserName { get; set; }
        public string? ModifiedByUserFullName { get; set; }
    }

    public class AccountCheckNameDto
    {
        public bool exists { get; set; }
        public string message { get; set; } = string.Empty;
    }
}