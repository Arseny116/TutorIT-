using ApplicationUsers.App.Queries;
using ApplicationUsers.Domain;
using ApplicationUsers.Infrastructure;
using CSharpFunctionalExtensions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ApplicationUsers.App.Handlers
{
    public class GetByEmail : IRequestHandler<GetUserByEmail, User>
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<GetByEmail> _logger;

        public GetByEmail(ILogger<GetByEmail> logger, IUserRepository userRepository)
        {
            _userRepository = userRepository;
            _logger = logger;
        }


        public async Task<User> Handle(GetUserByEmail request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetUserByEmail(request.email);
            _logger.Log(LogLevel.Debug, $"Получен   user ->  {user}");
            return user.Value;
        }
    }

    public class GetUser : IRequestHandler<GetUserById, User>
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<GetUser> _logger;

        public GetUser(ILogger<GetUser> logger, IUserRepository userRepository)
        {
            _userRepository = userRepository;
            _logger = logger;
        }


        public async Task<User> Handle(GetUserById request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetUserById(request.id);
            _logger.Log(LogLevel.Debug, $"Получен   user  ->  {user}");
            return user;
        }

    }


}
