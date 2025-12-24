using Incer.Web.Core.Entities;

namespace Incer.Web.Api.DTOs
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
        public IEnumerable<int> AccessibleApps { get; set; } = new List<int>();
        public IEnumerable<int> AccessibleCenters { get; set; } = new List<int>();
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Mail { get; set; }
        public string? Alias { get; set; }
        public byte[]? Foto { get; set; }
        public int RoleId { get; set; }
        public RoleDto? Role { get; set; }
        public bool IsActive { get; set; }
    }

    public class RoleDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}