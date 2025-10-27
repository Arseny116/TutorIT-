using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IAuthorsService
    {
        Task<List<Author>> GetAutors();

        Task<Guid> CreateAutor(Author autor);

        Task<Guid> UpdateAutor(Guid id, string name, string description);

        Task<Guid> DeleteAutor(Guid autorId);
    }
}
