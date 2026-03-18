using ApplicationUsers.Domain;

namespace ApplicationUsers.Infrastructure
{
    public interface IUserRepository
    {

        Task UpdateMyCourse(Guid user_res, Guid myCourse);

        Task UpdateForeginCourse(Guid user_res, Guid foreginCourse);

        Task<User> GetUserById(Guid id);
        Task<User> GetUserByEmail(string email);
        Task<Guid> CreateUser(User user);
        Task<List<User>> GetAllUser();
    }
}