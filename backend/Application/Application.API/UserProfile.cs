using Application.Domain;
using Application.Infrastructure;
using AutoMapper;

namespace Application.API
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<UserEntity, User>()
           .ConstructUsing(src => User.Create(
               src.Id,
               src.UserName,
               src.PasswordHash,
               src.Email))
           .ForAllMembers(opt => opt.Ignore());
        }
    }
}