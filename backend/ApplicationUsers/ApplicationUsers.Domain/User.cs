using CSharpFunctionalExtensions;
namespace ApplicationUsers.Domain
{
    public class User
    {
        public Guid Id { get; private set; }


        public string Name { get; private set; }

        public string Email { get; private set; }

        public string PasswordHash { get; private set; }

        public List<Guid> CreatedCourseIds { get;  private set; }

        public List<Guid> EnrolledCourseIds { get; private set; }

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
            if (string.IsNullOrWhiteSpace(name) || name.Length < 2 || name.Length > 20)
            {
                return Result.Failure<User>("Имя должно быть от 2 до 20 символов.");
            }

            if (string.IsNullOrWhiteSpace(email) || email.Length < 5 || email.Length > 30)
            {
                return Result.Failure<User>("Email должен быть от 5 до 30 символов.");
            }

            if (!email.Contains("@"))
            {
                return Result.Failure<User>("Некорректный формат Email.");
            }

            User user = new User(name, email, password);
            return Result.Success(user);
        }

        public void ChangePassword(string Newpassword)
        {
            PasswordHash = Newpassword;
        }

    }
}
