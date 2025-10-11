using Application.Domain.Models.RootCodeProblem;
using Application.Infrastructure.Entities.EntityExecutorCode;
using AutoMapper;

namespace Application.API.AutoMapper
{
    public class ProblemProfile :Profile
    {
        public ProblemProfile() 
        {
            //Если поля совпадают то этого хватит для создания профиля
            CreateMap<CodeProblemEntity, CodeProblem>();
        }
    }
}
