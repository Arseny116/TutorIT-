using CSharpFunctionalExtensions;
namespace ApplicationUsers.Domain
{
    public class User
    {
        public Guid Id { get; private set; }

        public string Name { get; private set; }

        public string Email { get; private set; }

        public string PasswordHash { get; private set; }

        private User(Guid id, string name, string email, string password)
        {
            Id = id;
            Name = name;
            Email = email;
            PasswordHash = password;
        }


        public static Result<User> CreateUser(Guid id, string name, string email, string password)
        {
            User user = new User(id, name, email, password);
            return Result.Success(user);
        }

        public void Rename(string NewName)
        {
            Name = NewName;
        }

        public void ChangePassword(string Newpassword)
        {
            PasswordHash = Newpassword; 
        }

    }
}
