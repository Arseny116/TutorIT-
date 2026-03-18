using ApplicationUsers.Domain;
using AutoMapper;

namespace ApplicationUsers.Infrastructure.Mapping
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<UserEntity, User>();

            CreateMap<User, UserEntity>();
        }
    }
}