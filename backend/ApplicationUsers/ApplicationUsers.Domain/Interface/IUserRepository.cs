using ApplicationUsers.Domain;
using CSharpFunctionalExtensions;

namespace ApplicationUsers.Infrastructure
{
    public interface IUserRepository
    {

        Task UpdateForeignCourse(Guid userId, Guid courseId);

        Task UpdateMyCourse(Guid userId, Guid courseId);

        Task<User> GetUserById(Guid id);
        Task<Result<User>> GetUserByEmail(string email);
        Task<Result<Guid>> CreateUser(User user, CancellationToken cancellationToken);
        Task<List<User>> GetAllUser();
     
    }
}