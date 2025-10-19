using Application.Domain.Interface;
using Application.Domain.Models;

namespace Application.App.Services
{
    public class AutorsService : IAutorsService
    {
        private readonly IAutorsRepository _autorsRepository;

        public AutorsService(IAutorsRepository autorsRepository)
        {
            _autorsRepository = autorsRepository;
        }

        public async Task<List<Autor>> CetAutors()
        {
            return await _autorsRepository.Get();
        }

        public async Task<Guid> CreateAutor(Autor autor)
        {
            return await _autorsRepository.Create(autor);
        }

        public async Task<Guid> UpdateAutor(Guid id, string name, string description)
        {
            return await _autorsRepository.Update(id, name, description);
        }

        public async Task<Guid> DeleteAutor(Guid autorId)
        {
            return await _autorsRepository.Delete(autorId);
        }
    }
}
