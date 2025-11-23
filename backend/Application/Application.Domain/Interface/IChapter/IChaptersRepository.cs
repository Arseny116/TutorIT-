using Application.Domain.Models;

namespace Application.Domain.Interface.IChapter
{
    public interface IChaptersRepository
    {
        Task<List<Chapter>> Get();

        Task<Guid> Create(Guid Coursesid, string name, string description, int numberTheoryBloks, int numberTasks);

        Task<Guid> Update(Guid id, string name, string description, int numberTheoryBloks, int numberTasks);

        Task<Guid> Delete(Guid id);
    }
}
