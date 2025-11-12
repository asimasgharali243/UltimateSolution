using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendWeightReader.Models
{
    [Table("tbl_item")] // Make sure this matches your actual table name
    public class Item
    {
        [Key]
        public int Item_ID { get; set; }
        
        public string? Item_Type { get; set; }
        public string? Item_Code { get; set; } // Add this based on your SQL
        public string? Item_Name { get; set; }
        public string? Item_NameUrdu { get; set; }
        public int? Category_ID { get; set; } // Based on your SQL query
        public int? subCategory_Id { get; set; }
    }
}