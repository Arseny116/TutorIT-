using Application.Domain.Models;

namespace Application.App.Services
{
    public interface IServiceCodeProblem
    {
        Task<List<ExecutionResult>> Execute(Guid id, string pythontext);
        Task<Guid> CreateCodeProblem(string title, string description, string difficulty);
    }
}