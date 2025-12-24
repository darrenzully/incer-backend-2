namespace Incer.Web.Api.DTOs
{
    public class AppLoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int AppId { get; set; }
    }
}
