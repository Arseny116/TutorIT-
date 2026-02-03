using Application.Domain.Models;

namespace Application.API.DTO.TasksCreator
{
    public record class TasksCreatorResponse(
        Guid Id,
        string? Name,
        string? Description,
        string? Hint,
        List<Question> Questions);
}
