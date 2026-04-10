using ApplicationUsers.App.Command;
using ApplicationUsers.Domain;
using ApplicationUsers.Domain.Interface;
using ApplicationUsers.Infrastructure;
using CSharpFunctionalExtensions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ApplicationUsers.App.Handlers
{
    public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, Result<Guid>>
    {
        private readonly IPasswordHasher _hasher;
        private readonly IUserRepository _userRepository;
        private readonly IMailService _mailService;
        private readonly ILogger _logger;

        public RegisterUserHandler(ILogger<RegisterUserHandler> logger,  IPasswordHasher hasher, IUserRepository userRepository, IMailService mailService)
        {
            _logger = logger;
            _hasher = hasher;
            _userRepository = userRepository;
            _mailService = mailService;
        }
    
        public async Task<Result<Guid>> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
        {
            var isNameUnique = await _userRepository.IsNameUnique(request.Name, cancellationToken);
            if (!isNameUnique)
            {
                return Result.Failure<Guid>("Пользователь с таким именем уже существует.");
            }

            var user = User.CreateUser(request.Name, request.Email, _hasher.Generate(request.Password));

            if (user.IsFailure)
            {
                return Result.Failure<Guid>(user.Error);
            }


            var mailData = new MailData(request.Email, "Добро пожаловать в TutorIt!");
            var isMailValid = await _mailService.SendHelloAsync(mailData);

            if (!isMailValid)
            {
                return Result.Failure<Guid>("Указанный почтовый домен не существует или недоступен.");
            }

            var user_guid = await _userRepository.CreateUser(user.Value, cancellationToken);

           

            return user_guid;
        }


    }
}
