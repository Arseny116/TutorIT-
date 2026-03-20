using CSharpFunctionalExtensions;
namespace ApplicationUsers.Domain
{
    public class User
    {
        public Guid Id { get; private set; }


        public string Name { get; private set; }

        public string Email { get; private set; }

        public string PasswordHash { get; private set; }

        public List<Guid> CreatedCourseIds { get; set; }

        public List<Guid> EnrolledCourseIds { get; set; }

        public User() { }
        private User(string name, string email, string password)
        {
            Name = name;
            Id = Guid.NewGuid();
            Email = email;
            PasswordHash = password;
        }


        public static Result<User> CreateUser(string name, string email, string password)
        {
            User user = new User(name, email, password);
            return Result.Success(user);
        }

        public void ChangePassword(string Newpassword)
        {
            PasswordHash = Newpassword;
        }

    }
}
