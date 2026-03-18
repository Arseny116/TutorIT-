using ApplicationUsers.App.Commands;
using ApplicationUsers.Domain;
using ApplicationUsers.Infrastructure;
using MediatR;

namespace ApplicationUsers.App.Handlers
{
    public class LoginUserHandler : IRequestHandler<LoginUserCommand, string>
    {
        private readonly IJwtProvider _jwtProvider;
        private readonly IUserRepository _userRepository;
        public LoginUserHandler(IUserRepository userRepository, IJwtProvider jwtProvider)
        {
            _jwtProvider = jwtProvider;
            _userRepository = userRepository;
        }


        public async Task<string> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            User user =  await _userRepository.GetUserByEmail(request.email);

        
            var token = _jwtProvider.GenerateToken(user);

            return token;
        }
    }
}

