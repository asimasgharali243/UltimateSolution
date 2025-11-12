namespace BackendWeightReader.Models
{
    public class LoginRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PIN { get; set; } = string.Empty;
    }
}
