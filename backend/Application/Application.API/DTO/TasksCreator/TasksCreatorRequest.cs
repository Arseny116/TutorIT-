using Application.Domain.Models;

namespace Application.API.DTO.TasksCreator
{
    public record class TasksCreatorRequest(
        string Name,
        string Description,
        List<Question> Questions);
}
