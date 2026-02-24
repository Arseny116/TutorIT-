using ApplicationUsers.App.Command;
using ApplicationUsers.Infrastructure;
using MediatR;
using ApplicationUsers.Domain;
using CSharpFunctionalExtensions;
namespace ApplicationUsers.App.Handlers
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<Guid>>
    {
        private readonly IPasswordHasher _hasher;
        private readonly IUserRepository _userRepository;
        public RegisterUserHandler(IPasswordHasher hasher, IUserRepository userRepository)
        {
            _hasher = hasher;
            _userRepository = userRepository;
        }
        public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            //Добавить проверку на сущ email, имения и тд ...
            var user = User.CreateUser(Guid.NewGuid(), request.Name, request.Email, _hasher.Generate(request.Password));

            if (user.IsFailure)
            {
                return Result.Failure<Guid>(user.Error);
            }

            return await _userRepository.CreateUser(user.Value);
        }
    }
}
