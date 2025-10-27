using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface ITasksCreatorRepository
    {
        Task<List<TaskCreator>> Get();

        Task<Guid> Create(TaskCreator taskCreator);

        Task<Guid> Update(Guid id, string name, string description);

        Task<Guid> Delete(Guid id);
    }
}
