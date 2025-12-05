using Application.Domain.Models;

namespace Application.Domain.Interface.ITaskQuestion.ITask
{
    public interface ITasksCreatorService
    {
        Task<List<TaskCreator>> GetTasksCreator(Guid ChapterId);

        Task<Guid> CreateTaskCreator(Guid ChapterId,TaskCreator taskCreator);

        Task<Guid> UpdateTaskCreator(Guid id, string name, string description);

        Task<Guid> DeleteTaskCreator(Guid taskId);
    }
}
