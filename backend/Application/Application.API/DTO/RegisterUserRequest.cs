using System.ComponentModel.DataAnnotations;

namespace Application.API.DTO
{
    public record RegisterUserRequest([Required]string UserName,[Required]string Password, [Required] string Email){ }
}
