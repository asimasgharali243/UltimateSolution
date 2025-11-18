using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblUserForm")]
    public class UserForm
    {
        [Key]
        public int formID { get; set; }

        [StringLength(50)]
        public string? formName { get; set; }

        [StringLength(50)]
        public string? formDisplayName { get; set; }
          // Add these missing properties
    public string Menu { get; set; }
    public int sortOrder { get; set; }
    }
}