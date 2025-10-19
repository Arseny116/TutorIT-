using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IAutorsService
    {
        Task<List<Autor>> CetAutors();

        Task<Guid> CreateAutor(Autor autor);

        Task<Guid> UpdateAutor(Guid id, string name, string description);

        Task<Guid> DeleteAutor(Guid autorId);
    }
}
