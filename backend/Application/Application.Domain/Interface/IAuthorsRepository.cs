using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IAuthorsRepository
    {
        Task<List<Author>> Get();

        Task<Guid> Create(Author autor);

        Task<Guid> Update(Guid id, string name, string description);

        Task<Guid> Delete(Guid id);
    }
}
