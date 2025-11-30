using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IChaptersService
    {
        Task<List<Chapter>> GetChapters();

        Task<Guid> CreateChapter(Guid Coursesid, Chapter chapter);

        Task<Guid> UpdateChapter(Guid id, string name, string description, int numberTheoryBloks, int numberTasks);

        Task<Guid> DeleteChapter(Guid id);
    }
}
