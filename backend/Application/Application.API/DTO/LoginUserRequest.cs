using System.ComponentModel.DataAnnotations;

namespace Application.API.DTO
{
    public record LoginUserRequest([Required] string Email, [Required] string Password) { }
}
