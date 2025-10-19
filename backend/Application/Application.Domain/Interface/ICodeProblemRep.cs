using Application.Domain.Models.RootCodeProblem;

namespace Application.Infrastructure.Repositories
{
    public interface ICodeProblemRep
    {
        Task<CodeProblem> GetById(Guid Id);

        Task<Guid> Create(string title, string description, string difficulty);

        Task<List<CodeProblem>> GetAll();
    }
}