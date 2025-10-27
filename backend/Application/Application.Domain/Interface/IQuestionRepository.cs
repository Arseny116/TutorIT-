using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IQuestionRepository
    {
        Task<List<Question>> Get();

        Task<Guid> Create(Question question);

        Task<Guid> Update(Guid id, string name, bool answer);

        Task<Guid> Delete(Guid id);
    }
}
