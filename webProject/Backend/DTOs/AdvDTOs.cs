using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class MasterCreateDto
    {
        [Required]
        public int vNo { get; set; }
        
        public string? billNo { get; set; }
        
        public DateTime? billDate { get; set; }
        
        public string? roNo { get; set; }
        public DateTime? roDate { get; set; }
        public string? Notes { get; set; }
        
        [Required]
        public int clientID { get; set; }
        
        public string? agencyName { get; set; }
        public string? pID { get; set; }
        public string? caption { get; set; }
        
        [Required]
        public int frontPageExtra { get; set; } = 0;
        
        [Required]
        public int backPageExtra { get; set; } = 0;
        
        [Required]
        public int comission { get; set; } = 0;
        
        [Required]
        public int createdBy { get; set; }
        
        [Required]
        public List<DetailCreateDto> Details { get; set; } = new List<DetailCreateDto>();
    }

    public class DetailCreateDto
    {
        public DateTime? inserationDate { get; set; }
        public string? color { get; set; }
        public string? size { get; set; }
        public string? totalSpace { get; set; }
        public string? position { get; set; }
        
        [Required]
        public int rate { get; set; }
    }

    public class MasterUpdateDto
    {
        [Required]
        public int vNo { get; set; }
        
        public string? billNo { get; set; }
        public DateTime? billDate { get; set; }
        public string? roNo { get; set; }
        public DateTime? roDate { get; set; }
        public string? Notes { get; set; }
        
        [Required]
        public int clientID { get; set; }
        
        public string? agencyName { get; set; }
        public string? pID { get; set; }
        public string? caption { get; set; }
        
        [Required]
        public int frontPageExtra { get; set; }
        
        [Required]
        public int backPageExtra { get; set; }
        
        [Required]
        public int comission { get; set; }
        
        [Required]
        public int modifyBy { get; set; }
        
        [Required]
        public List<DetailCreateDto> Details { get; set; } = new List<DetailCreateDto>();
    }

    public class MasterResponseDto
    {
        public int masterID { get; set; }
        public int vNo { get; set; }
        public string? billNo { get; set; }
        public DateTime? billDate { get; set; }
        public string? roNo { get; set; }
        public DateTime? roDate { get; set; }
        public string? Notes { get; set; }
        public int? clientID { get; set; }
        public string? agencyName { get; set; }
        public string? pID { get; set; }
        public string? caption { get; set; }
        public int frontPageExtra { get; set; }
        public int backPageExtra { get; set; }
        public int comission { get; set; }
        public DateTime? createdDT { get; set; }
        public DateTime? modifyDT { get; set; }
        public string? ClientName { get; set; }
        public string? ClientContactNumber { get; set; }
        public List<DetailResponseDto> Details { get; set; } = new List<DetailResponseDto>();
        public int TotalAmount { get; set; }
        public int ExtrasAmount { get; set; }
        public int GrossTotal { get; set; }
        public int NetAmount { get; set; }
    }

    public class DetailResponseDto
    {
        public int id { get; set; }
        public int masterID { get; set; }
        public DateTime? inserationDate { get; set; }
        public string? color { get; set; }
        public string? size { get; set; }
        public string? totalSpace { get; set; }
        public string? position { get; set; }
        public int rate { get; set; }
    }

    public class ClientResponseDto
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? ContactNumber { get; set; }
        public string? WhatsAppNumber { get; set; }
        public string? GroupHeadName { get; set; }
        public string? GroupHeadNumber { get; set; }
        public string? CityOfResidence { get; set; }
        public DateTime PassportValidity { get; set; }
        public string? SpecialRequirements { get; set; }
    }
}