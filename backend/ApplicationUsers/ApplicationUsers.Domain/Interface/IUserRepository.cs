using ApplicationUsers.Domain;

namespace ApplicationUsers.Infrastructure
{
    public interface IUserRepository
    {
        Task<Guid> CreateUser(User user);
        Task<List<User>> GetAllUser();
    }
}