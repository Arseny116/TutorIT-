using ApplicationUsers.Domain;

namespace ApplicationUsers.Infrastructure
{
    public interface IJwtProvider
    {
        string GenerateToken(User user);
    }
}