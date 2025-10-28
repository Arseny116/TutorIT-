using Application.Domain.Models.TaskQuestion;

namespace Application.API.DTO.TasksCreator
{
    public record class TasksCreatorResponse(
        Guid Id,
        string? Name,
        string? Description,
        List<Question> Questions);
}
