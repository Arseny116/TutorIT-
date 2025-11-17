using Application.Domain.Interface.IAuthor;
using Application.Domain.Models;

namespace Application.App.Services
{
    public class AuthorsService : IAuthorsService
    {
        private readonly IAuthorsRepository _autorsRepository;

        public AuthorsService(IAuthorsRepository autorsRepository)
        {
            _autorsRepository = autorsRepository;
        }

        public async Task<List<Author>> GetAuthors()
        {
            return await _autorsRepository.Get();
        }

        public async Task<Guid> CreateAutor(Author autor)
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
