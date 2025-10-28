using Application.Domain.Models.TaskQuestion;

namespace Application.API.DTO.TasksCreator
{
    public record class TasksCreatorRequest(
        string Name,
        string Description);
}
