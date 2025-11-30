using Application.Domain.Models;

namespace Application.Domain.Interface.ITaskQuestion.IQuestion
{
    public interface IQuestionsRepository
    {
        Task<List<Question>> Get();

        Task<Guid> Create(Guid TaskCreatorId , Question question);

        Task<Guid> Update(Guid id, string name, bool answer);

        Task<Guid> Delete(Guid id);
    }
}
