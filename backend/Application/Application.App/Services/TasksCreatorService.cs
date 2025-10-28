using Application.Domain.Interface;
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

        public async Task<List<TaskCreator>> GetTasksCreator()
        {
            return await _tasksCreatorRepository.Get();
        }

        public async Task<Guid> CreateTaskCreator(TaskCreator taskCreator)
        {
            return await _tasksCreatorRepository.Create(taskCreator);
        }

        public async Task<Guid> UpdateTaskCreator(Guid id, string name, string description, List<Question> questions)
        {
            return await _tasksCreatorRepository.Update(id, name, description, questions);
        }

        public async Task<Guid> DeleteTaskCreator(Guid id)
        {
            return await _tasksCreatorRepository.Delete(id);
        }
    }
}
