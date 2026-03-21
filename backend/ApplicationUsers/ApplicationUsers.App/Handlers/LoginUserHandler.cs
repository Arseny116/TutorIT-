using ApplicationUsers.App.Commands;
using ApplicationUsers.Domain;
using ApplicationUsers.Infrastructure;
using CSharpFunctionalExtensions;
using MediatR;

namespace ApplicationUsers.App.Handlers
{
    public class LoginUserHandler : IRequestHandler<LoginUserCommand, Result<string>>
    {
        private readonly IJwtProvider _jwtProvider;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _hasher;
        public LoginUserHandler(IPasswordHasher hasher, IUserRepository userRepository, IJwtProvider jwtProvider)
        {
            _jwtProvider = jwtProvider;
            _userRepository = userRepository;
            _hasher = hasher;
        }


        public async Task<Result<string>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            var userDB = await _userRepository.GetUserByEmail(request.email);

            if (userDB.IsFailure)
                return Result.Failure<string>("Пользователь не найден "); ;


            if (!_hasher.Verify(request.password, userDB.Value.PasswordHash))
                return Result.Failure<string>("Введен не правильный пароль ");

            var token = _jwtProvider.GenerateToken(userDB.Value);

            return token;
        }
    }
}

