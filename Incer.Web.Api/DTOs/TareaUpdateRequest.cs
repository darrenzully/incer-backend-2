using System.ComponentModel.DataAnnotations;

namespace Incer.Web.Api.DTOs
{
    public class TareaUpdateRequest : TareaCreateRequest
    {
        [Required]
        public int Id { get; set; }
    }
}
