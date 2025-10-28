using Application.Domain.Models.RootCodeProblem;

namespace Application.Domain.Interface.ICodeExecutor
{
    public interface ICodeProblemRep
    {
        Task AddTestCase(Guid id, string input, string output);
        Task<Guid> Create(string title, string description, string difficulty);
        Task<bool> Delete(Guid id);
        Task<List<CodeProblem>> GetAll();
        Task<CodeProblem> GetById(Guid Id);

        Task<List<TestCase>> GetAllTestCase(Guid id);
    }
}