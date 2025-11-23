using Application.Domain.Models;

namespace Application.Domain.Interface.IChapter
{
    public interface IChaptersService
    {
        Task<List<Chapter>> GetChapters();

        Task<Guid> CreateChapter(Guid Coursesid, string name, string description, int numberTheoryBloks, int numberTasks);

        Task<Guid> UpdateChapter(Guid id, string name, string description, int numberTheoryBloks, int numberTasks);

        Task<Guid> DeleteChapter(Guid id);
    }
}
