using Application.Domain;

namespace Application.Domain.Interface
{
    public interface IUserRepository
    {
        Task Add(User user);
        Task<User> GetByEmail(string email);
    }
}