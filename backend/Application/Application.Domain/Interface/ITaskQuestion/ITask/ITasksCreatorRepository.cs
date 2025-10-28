using Application.Domain.Models.TaskQuestion;

namespace Application.Domain.Interface.ITaskQuestion.ITask
{
    public interface ITasksCreatorRepository
    {
        Task<List<TaskCreator>> Get();

        Task<Guid> Create(TaskCreator taskCreator);

        Task<Guid> Update(Guid id, string name, string description, List<Question> questions);

        Task<Guid> Delete(Guid id);
    }
}
