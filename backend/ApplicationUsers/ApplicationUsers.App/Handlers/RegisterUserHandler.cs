using ApplicationUsers.App.Command;
using ApplicationUsers.Infrastructure;
using MediatR;
using ApplicationUsers.Domain;
using CSharpFunctionalExtensions;
using ApplicationUsers.Domain.Interface;
using Microsoft.Extensions.Logging;
namespace ApplicationUsers.App.Handlers
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<Guid>>
    {
        private readonly IPasswordHasher _hasher;
        private readonly IUserRepository _userRepository;
        private readonly ILogger _logger;

        public RegisterUserHandler(ILogger<RegisterUserHandler> logger,  IPasswordHasher hasher, IUserRepository userRepository)
        {
            _logger = logger;
            _hasher = hasher;
            _userRepository = userRepository;
        }
    
        public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {

            var user = User.CreateUser(request.Name, request.Email, _hasher.Generate(request.Password));

            if (user.IsFailure)
            {
                return Result.Failure<Guid>(user.Error);
            }

            var user_guid = await _userRepository.CreateUser(user.Value, cancellationToken);

           

            return user_guid;
        }


    }
}
