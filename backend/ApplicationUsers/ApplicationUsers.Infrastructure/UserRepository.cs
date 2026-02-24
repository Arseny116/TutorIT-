using ApplicationUsers.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApplicationUsers.Infrastructure
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationUserDB _context;
        public UserRepository(ApplicationUserDB applicationUser)
        {
            _context = applicationUser;
        }

        public async Task<List<User>> GetAllUser()
        {
            return await _context.Users.Select(x => User.CreateUser(x.Id, x.Name, x.Email, x.Password).Value).ToListAsync();
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
