using Application.Domain.Models;

namespace Application.Domain.Interface
{
    public interface ITasksCreatorService
    {
        Task<List<TaskCreator>> GetTasksCreator();

        Task<Guid> CreateTaskCreator(TaskCreator taskCreator);

        Task<Guid> UpdateTaskCreator(Guid id, string name, string description);

        Task<Guid> DeleteTaskCreator(Guid taskId);
    }
}
