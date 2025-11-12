using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblUserRights")]
    public class UserRights
    {
        [Key]
        public int id { get; set; }

        public int? userID { get; set; }

        public int? formID { get; set; }

        public bool? CanView { get; set; }

        public bool? CanSave { get; set; }

        public bool? CanUpdate { get; set; }

        public bool? CanDelete { get; set; }

        public bool? CanPost { get; set; }

        // Navigation properties
        [ForeignKey("userID")]
        public virtual User? User { get; set; }

        [ForeignKey("formID")]
        public virtual UserForm? UserForm { get; set; }
    }
}