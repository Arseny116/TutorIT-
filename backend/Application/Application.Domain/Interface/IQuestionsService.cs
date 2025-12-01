using Application.Domain.Models;

namespace Application.Domain.Interface.ITaskQuestion.IQuestion
{
    public interface IQuestionsService
    {
        Task<List<Question>> GetQuestions(Guid TaskCreater);

        Task<Guid> CreateQuestion(Guid TaskCreatorId ,Question question);

        Task<Guid> UpdateQuestion(Guid id, string name, bool answer);

        Task<Guid> DeleteQuestion(Guid id);
    }
}
