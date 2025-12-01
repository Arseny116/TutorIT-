using Application.Domain.Interface.ITaskQuestion.ITask;
using Application.Domain.Models;

namespace Application.App.Services
{
    public class TasksCreatorService : ITasksCreatorService
    {
        private readonly ITasksCreatorRepository _tasksCreatorRepository;

        public TasksCreatorService(ITasksCreatorRepository tasksCreatorRepository)
        {
            _tasksCreatorRepository = tasksCreatorRepository;
        }

        public async Task<List<TaskCreator>> GetTasksCreator(Guid ChapterId)
        {
            return await _tasksCreatorRepository.Get(ChapterId);
        }

        public async Task<Guid> CreateTaskCreator(Guid ChapterId, TaskCreator taskCreator)
        {
            return await _tasksCreatorRepository.Create(ChapterId ,taskCreator);
        }

        public async Task<Guid> UpdateTaskCreator(Guid id, string name, string description)
        {
            return await _tasksCreatorRepository.Update(id, name, description);
        }

        public async Task<Guid> DeleteTaskCreator(Guid id)
        {
            return await _tasksCreatorRepository.Delete(id);
        }
    }
}
