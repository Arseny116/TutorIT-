using Application.Domain.Models;
using Application.Domain.Models.RootCodeProblem;

namespace Application.App.Services
{
    public interface IServiceCodeProblem
    {
        Task AddTestCase(Guid id, string input, string output);
        Task<Guid> CreateCodeProblem(string title, string description, string difficulty);
        Task<bool> Delete(Guid id);
        Task<List<ExecutionResult>> Execute(Guid id, string pythonCode);
        Task<List<CodeProblem>> GetAll();
        Task<CodeProblem> GetById(Guid Id);

        Task<List<TestCase>> GetAllTestCase(Guid id);
    }
}