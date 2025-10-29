using Application.Domain.Interface;

namespace Application.Infrastructure
{
    public class PasswordHasher : IPasswordHasher
    {

        //Хеширует пароль
        public string Generate(string password) =>
            BCrypt.Net.BCrypt.EnhancedHashPassword(password);


        //Проверяет пароль
        public bool Verify(string password, string hashedPassword) =>
            BCrypt.Net.BCrypt.EnhancedVerify(password, hashedPassword);

    }


}
