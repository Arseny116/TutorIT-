using Application.Domain.Models.TaskQuestion;

namespace Application.Domain.Interface.ITaskQuestion.IQuestion
{
    public interface IQuestionsService
    {
        Task<List<Question>> GetQuestions();

        Task<Guid> CreateQuestion(Question question);

        Task<Guid> UpdateQuestion(Guid id, string name, bool answer);

        Task<Guid> DeleteQuestion(Guid id);
    }
}
