using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.DTOs
{
    public class AuditEntry
    {
        public AuditEntry(EntityEntry entry) => Entry = entry;
        public EntityEntry Entry { get; }
        public string TableName { get; set; } = string.Empty;
        public string? RecordId { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? IPAddress { get; set; }
        public string? DeviceInfo { get; set; }
        public List<AuditChange> Changes { get; } = new List<AuditChange>();
    }

    public class AuditChange
    {
        public string ColumnName { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string ActionType { get; set; } = string.Empty;
    }
}