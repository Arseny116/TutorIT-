using ApplicationUsers.Domain;
using AutoMapper;
using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;

namespace ApplicationUsers.Infrastructure
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationUserDB _context;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher _hasher;

        public UserRepository(IPasswordHasher passwordHasher, IMapper mapper, ApplicationUserDB applicationUser)
        {
            _context = applicationUser;
            _hasher = passwordHasher;
            _mapper = mapper;
        }




        public async Task<Result<Guid>> CreateUser(User user, CancellationToken cancellationToken)
        {
            ArgumentNullException.ThrowIfNull(user);

            var normalizedEmail = user.Email.ToLowerInvariant().Trim();

            var exists = await _context.Users
                .AnyAsync(u => u.Email == normalizedEmail, cancellationToken);

            if (exists)
                return Result.Failure<Guid>($"Email {normalizedEmail} already exists");

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
            _context.Users.Update(_mapper.Map<UserEntity>(User));
            await _context.SaveChangesAsync();

        }


        public async Task<User> GetUserByEmail(string email)
        {
            var userEntity = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);
            var user = _mapper.Map<User>(userEntity);
            return _mapper.Map<User>(userEntity);
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
