using Application.Domain.Models;

namespace Application.Domain.Interface.IAuthor
{
    public interface IAuthorsService
    {
        Task<List<Author>> GetAuthors();

        Task<Guid> CreateAutor(Author autor);

        Task<Guid> UpdateAutor(Guid id, string name, string description);

        Task<Guid> DeleteAutor(Guid autorId);
    }
}
