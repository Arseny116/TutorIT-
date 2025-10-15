using Application.Domain.Models.RootCodeProblem;

namespace Application.Infrastructure.Repositories
{
    public interface ICodeProblemRep
    {
        Task Create(string title, string description, string difficulty);
        Task<CodeProblem> GetById(Guid Id);
    }
}