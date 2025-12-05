using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Domain;
using Application.Domain.Interface;
using AutoMapper;
using Microsoft.EntityFrameworkCore;



namespace Application.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly TutorITDbContext _dboptions;

        private readonly IMapper _mapper;



        public UserRepository(TutorITDbContext dboptions, IMapper Mapper)
        {
            _dboptions = dboptions;
            _mapper = Mapper;
        }


        public async Task<User> GetByEmail(string email)
        {
            var userEntity = await _dboptions.Users
                .AsNoTracking() //
                .FirstOrDefaultAsync(x => x.Email == email);

            return _mapper.Map<User>(userEntity);//Автоматически переносить св-ва Entity в User
        }


        public async Task Add(User user)
        {
            var userEntity = new UserEntity()
            {
                Id = user.Id,

                UserName = user.UserName,

                PasswordHash = user.PasswordHash,

                Email = user.Email,

            };

            await _dboptions.Users.AddAsync(userEntity);

            await _dboptions.SaveChangesAsync();
        }

    }
}
