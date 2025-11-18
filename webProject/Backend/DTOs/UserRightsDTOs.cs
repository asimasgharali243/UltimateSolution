namespace Backend.DTOs
{
    public class BulkUserRightsRequest
    {
        public List<UserRightsDto> UserRights { get; set; } = new List<UserRightsDto>();
    }

    public class UserRightsDto
    {
        public int UserID { get; set; }
        public int FormID { get; set; }
        public bool CanView { get; set; }
        public bool CanSave { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
        public bool CanPost { get; set; }
    }

    public class UserRightsResponse
    {
        public int Id { get; set; }
        public int? UserID { get; set; }
        public int? FormID { get; set; }
        public string FormName { get; set; } = string.Empty;
        public string FormSystemName { get; set; } = string.Empty;
        public bool CanView { get; set; }
        public bool CanSave { get; set; }
        public bool CanUpdate { get; set; }
        public bool CanDelete { get; set; }
        public bool CanPost { get; set; }
    }
}