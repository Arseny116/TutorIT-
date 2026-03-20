using ApplicationUsers.Domain;
using CSharpFunctionalExtensions;

namespace ApplicationUsers.Infrastructure
{
    public interface IUserRepository
    {

        Task UpdateMyCourse(Guid user_res, Guid myCourse);

        Task UpdateForeginCourse(Guid user_res, Guid foreginCourse);

        Task<User> GetUserById(Guid id);
        Task<User> GetUserByEmail(string email);
        Task<Result<Guid>> CreateUser(User user, CancellationToken cancellationToken);
        Task<List<User>> GetAllUser();
    }
}