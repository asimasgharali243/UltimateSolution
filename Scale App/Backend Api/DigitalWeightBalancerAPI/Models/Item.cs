using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalWeightBalancerAPI.Models
{
     [Table("tbl_Item")]
    public class Item
    {
        public int item_ID { get; set; }
        public string? item_Type { get; set; }
        public string? Item_Name { get; set; }
        public string? Item_NameUrdu { get; set; }
        public int? subCategory_Id { get; set; }
    }
}
