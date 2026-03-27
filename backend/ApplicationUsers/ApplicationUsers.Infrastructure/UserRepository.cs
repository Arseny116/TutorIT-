using ApplicationUsers.Domain;
using AutoMapper;
using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using ApplicationUsers.Domain.Interface;
using Microsoft.Extensions.Logging;
namespace ApplicationUsers.Infrastructure
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationUserDB _context;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher _hasher;
        private readonly IMailService _mailService;
        private readonly ILogger<UserRepository> _logger;
        public UserRepository(ILogger<UserRepository> logger, IMailService mailService, IPasswordHasher passwordHasher, IMapper mapper, ApplicationUserDB applicationUser)
        {
            _mailService = mailService;
            _context = applicationUser;
            _hasher = passwordHasher;
            _mapper = mapper;
            _logger = logger;
        }




        public async Task<Result<Guid>> CreateUser(User user, CancellationToken cancellationToken)
        {
            ArgumentNullException.ThrowIfNull(user);

            var normalizedEmail = user.Email.ToLowerInvariant().Trim();

            var exists = await _context.Users
                .AnyAsync(u => u.Email == normalizedEmail, cancellationToken);

            if (exists)
                return Result.Failure<Guid>($"Почта {normalizedEmail} уже  существует ");

            //Ниже код - ужас это надо передалть иначе GG
            MailData mailData = new MailData(user.Email, "Приветсвтуем на сайте TutorIT&");

            var result = await _mailService.SendHelloAsync(mailData);

            if (!result)
            {
                return Result.Failure<Guid>("Введина не существующая почта ");
            }


            var userEntity = new UserEntity
            {
                Id = user.Id,
                Email = normalizedEmail,
                Name = user.Name,
                PasswordHash = user.PasswordHash,
            };

            await _context.Users.AddAsync(userEntity, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success(userEntity.Id);
        }



        public async Task UpdateMyCourse(Guid user_res, Guid myCourse)
        {
            var User = GetUserById(user_res).Result;
            User.CreatedCourseIds.Add(myCourse);
            _context.Users.Update(_mapper.Map<UserEntity>(User));
            await _context.SaveChangesAsync();

        }


        public async Task UpdateForeginCourse(Guid user_res, Guid foreginCourse)
        {
            var User = GetUserById(user_res).Result;
            User.EnrolledCourseIds.Add(foreginCourse);
            _logger.Log(LogLevel.Information,$"{User.EnrolledCourseIds.Count}" );
            _context.Users.Update(_mapper.Map<UserEntity>(User));
            await _context.SaveChangesAsync();

        }


        public async Task<Result<User>> GetUserByEmail(string email)
        {
            var userEntity = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);

            if (userEntity == null)
                return Result.Failure<User>($"Пользователь с почтой {email} не найден ");

            var user = _mapper.Map<User>(userEntity);
            return user;

        }

        public async Task<User> GetUserById(Guid id)
        {
            return _mapper.Map<User>(await _context.Users.FindAsync(id));
        }

        public async Task<List<User>> GetAllUser()
        {
            return await _context.Users.Select(x => _mapper.Map<User>(x)).ToListAsync();
        }

    }
}
