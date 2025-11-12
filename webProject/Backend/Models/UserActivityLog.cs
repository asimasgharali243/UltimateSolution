using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("tblUserActivityLog")]
    public class UserActivityLog
    {
        [Key]
        public int LogId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string TableName { get; set; } = string.Empty;
        public string? RecordId { get; set; }
        public string? ColumnName { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public DateTime ActionDate { get; set; } = DateTime.Now;
        public string? IPAddress { get; set; }
        public string? DeviceInfo { get; set; }
        public string? Remarks { get; set; }
    }
}