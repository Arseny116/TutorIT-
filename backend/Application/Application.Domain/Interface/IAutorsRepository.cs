using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface IAutorsRepository
    {
        Task<List<Autor>> Get();

        Task<Guid> Create(Autor autor);

        Task<Guid> Update(Guid id, string name, string description);

        Task<Guid> Delete(Guid id);
    }
}
