using Application.Domain.Interface;
using Application.Domain.Models;

namespace Application.App.Services
{
    public class ChaptersService : IChaptersService
    {
        private readonly IChaptersRepository _chaptersRepository;

        public ChaptersService(IChaptersRepository chaptersRepository)
        {
            _chaptersRepository = chaptersRepository;
        }

        public async Task<List<Chapter>> GetChapters()
        {
            return await _chaptersRepository.Get();
        }

        public async Task<Guid> CreateChapter(Guid Coursesid, Chapter chapter)
        {
            return await _chaptersRepository.Create( Coursesid, chapter);
        }

        public async Task<Guid> UpdateChapter(Guid id, string name, string description, int numberTheoryBloks, int numberTasks)
        {
            return await _chaptersRepository.Update(id, name, description, numberTheoryBloks, numberTasks);
        }

        public async Task<Guid> DeleteChapter(Guid id)
        {
            return await _chaptersRepository.Delete(id);
        }
    }
}
