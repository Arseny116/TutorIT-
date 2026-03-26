using Application.Domain.Models;

namespace Application.Domain.Interface.ITheory
{
    public interface ITheoriesService
    {
        Task<List<Theory>> GetTheories(Guid ChapterId);

        Task<Guid> CreateTheory(Guid ChapterId, Theory theory);

        Task<Guid> UpdateTheory(Guid id, string name, string article);

        Task<Guid> DeleteTheory(Guid id);
    }
}
