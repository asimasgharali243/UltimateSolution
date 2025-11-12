using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalWeightBalancerAPI.Models
{
    [Table("tblScale")]
    public class Scan
    {
        [Key]
        public int sr1 { get; set; }

        public DateTime datetime { get; set; }

        [Required]
        public string product_name { get; set; }

        [Required]
        public string type { get; set; } // digital / non-digital

        public string? weight_value { get; set; }

        public int? quantity { get; set; }

        public string? image_uri { get; set; }

        public string? input_token { get; set; }

        public string? output_token { get; set; }

        public string? total_token { get; set; }

        public bool? sync_status { get; set; }
    }
}
