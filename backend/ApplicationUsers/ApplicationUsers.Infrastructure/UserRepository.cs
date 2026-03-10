using ApplicationUsers.Domain;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace ApplicationUsers.Infrastructure
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationUserDB _context;
        private readonly IMapper _mapper;
        public UserRepository(IMapper mapper,ApplicationUserDB applicationUser)
        {
            _context = applicationUser;
            _mapper = mapper;
        }

        public async Task<User> GetUserByEmail(string email)
        {
            var userEntity = await _context.Users.FindAsync(email);
            if (userEntity == null)
            {
                return null;
            }
            return  _mapper.Map<User>(userEntity);
        }

        public async Task<List<User>> GetAllUser()
        {
            return await _context.Users.Select(x => _mapper.Map<User>(x) ).ToListAsync();
        }


        public async Task<Guid> CreateUser(User user)
        {
            var userEntity = new UserEntity()
            {
                Id = user.Id,

                Name = user.Name,

                Password = user.PasswordHash,

                Email = user.Email,

            };

            await _context.Users.AddAsync(userEntity);

            await _context.SaveChangesAsync();

            return userEntity.Id;
        }

    }
}
