using Application.Domain;
namespace Application.Domain.Interface
{
    public interface IJwtProvider
    {
        string GenerateToken(User user);
    }
}