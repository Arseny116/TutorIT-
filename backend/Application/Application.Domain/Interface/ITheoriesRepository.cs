using Application.Domain.Models;

namespace Application.Domain.Interface.ITheory
{
    public interface ITheoriesRepository
    {
        Task<List<Theory>> Get(Guid ChapterId);

        Task<Guid> Create(Guid chapetId ,Theory theory);

        Task<Guid> Update(Guid id, string name, string article);

        Task<Guid> Delete(Guid id);
    }
}
