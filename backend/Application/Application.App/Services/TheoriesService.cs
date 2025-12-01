using Application.Domain.Interface.ITheory;
using Application.Domain.Models;

namespace Application.App.Services
{
    public class TheoriesService : ITheoriesService
    {
        private readonly ITheoriesRepository _theoriesRepository;

        public TheoriesService(ITheoriesRepository theoriesRepository)
        {
            _theoriesRepository = theoriesRepository;
        }

        public async Task<List<Theory>> GetTheories(Guid ChapterId)
        {
            return await _theoriesRepository.Get(ChapterId);
        }

        public async Task<Guid> CreateTheory(Guid ChapterId,Theory theory)
        {
            return await _theoriesRepository.Create(ChapterId,theory);
        }

        public async Task<Guid> UpdateTheory(Guid id, string name, string article)
        {
            return await _theoriesRepository.Update(id, name, article);
        }

        public async Task<Guid> DeleteTheory(Guid id)
        {
            return await _theoriesRepository.Delete(id);
        }
    }
}
