using Application.Domain.Models;

namespace Application.API.DTO.TasksCreator
{
    public record class TasksCreatorResponse(
        Guid Id,
        string? Name,
        string? Description,
        List<Question> Questions);
}
