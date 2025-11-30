using Application.Domain.Models;

namespace Application.Domain.Interface.ITaskQuestion.ITask
{
    public interface ITasksCreatorRepository
    {
        Task<List<TaskCreator>> Get();

        Task<Guid> Create(Guid ChapterId, TaskCreator taskCreator);

        Task<Guid> Update(Guid id, string name, string description);

        Task<Guid> Delete(Guid id);
    }
}
