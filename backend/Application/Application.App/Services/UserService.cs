using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Domain;
using Application.Domain.Interface;


namespace Application.App
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtProvider _jwtProvider;

        public UserService(IUserRepository userRepository, IPasswordHasher PasswordHasher, IJwtProvider JwtProvider)
        {
            _userRepository = userRepository;
            _passwordHasher = PasswordHasher;
            _jwtProvider = JwtProvider;
        }
        
        public async Task Register(string userName, string email, string password)
        {
            var hashedPassword = _passwordHasher.Generate(password);

            var user = User.Create(Guid.NewGuid(), userName, hashedPassword, email);

            await _userRepository.Add(user);
        }

        public async Task<string> Login(string email, string password)
        {
            var user = await _userRepository.GetByEmail(email);

            var result = _passwordHasher.Verify(password, user.PasswordHash);

            if (result == false)
            {
                throw new Exception("Ошибка"); //поменять на нормальную If
            }

            var token = _jwtProvider.GenerateToken(user);


            return token;
        }
    }
}
