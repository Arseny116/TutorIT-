
using ApplicationUsers.App.Commands;
using ApplicationUsers.Domain;
using ApplicationUsers.Infrastructure;
using MediatR;

namespace ApplicationUsers.App.Handlers
{
    public class LoginUserHandler : IRequestHandler<LoginUserCommand>
    {
        private readonly IJwtProvider _jwtProvider;
        private readonly IUserRepository _userRepository;
        public LoginUserHandler(IUserRepository userRepository ,IJwtProvider  jwtProvider)
        {
            _jwtProvider = jwtProvider;
            _userRepository =  userRepository;
        }


        public Task Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            User user = _userRepository.;
            _jwtProvider.GenerateToken(User);
        }
    }
}

