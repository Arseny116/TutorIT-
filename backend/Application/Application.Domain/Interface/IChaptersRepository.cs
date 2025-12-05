using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IChaptersRepository
    {
        Task<List<Chapter>> Get(Guid CourseId);

        Task<Guid> Create(Guid Coursesid, Chapter chapter);

        Task<Guid> Update(Guid id, string name, string description, int numberTheoryBloks, int numberTasks);

        Task<Guid> Delete(Guid id);
    }
}
