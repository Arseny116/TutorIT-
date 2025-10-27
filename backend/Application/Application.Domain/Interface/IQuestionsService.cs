using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IQuestionsService
    {
        Task<List<Question>> GetQuestions();

        Task<Guid> CreateQuestion(Question question);

        Task<Guid> UpdateQuestion(Guid id, string name, bool answer);

        Task<Guid> DeleteQuestion(Guid id);
    }
}
