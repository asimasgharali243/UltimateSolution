using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("clients")]
    public class Client
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        [Column("full_name")]
        public string? FullName { get; set; }

        
        [StringLength(20)]
        [Column("contact_number")]
        public string? ContactNumber { get; set; }

        [StringLength(20)]
        [Column("whatsapp_number")]
        public string? WhatsAppNumber { get; set; }

        [StringLength(255)]
        [Column("group_head_name")]
        public string? GroupHeadName { get; set; }

        [StringLength(20)]
        [Column("group_head_number")]
        public string? GroupHeadNumber { get; set; }

        
        [StringLength(255)]
        [Column("city_of_residence")]
        public string? CityOfResidence { get; set; }

        
        [Column("passport_validity")]
        public DateTime PassportValidity { get; set; }

        [Column("special_requirements")]
        public string? SpecialRequirements { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}