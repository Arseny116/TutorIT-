using Application.Domain.Models;

namespace Application.API.DTO.TasksCreator
{
    public record class TasksCreatorResponse(
        Guid id,
        string? name,
        string? description,
        List<Question> questions);
}
