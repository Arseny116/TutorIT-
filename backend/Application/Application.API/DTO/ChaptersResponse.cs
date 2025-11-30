using Application.Domain.Models;

namespace Application.API.DTO.Chapters
{
    public record class ChaptersResponse(
        Guid id,
        string? Name,
        string? Description,
        int NumberTheoryBloks,
        int NumberTasks,
        List<Theory> Theories,
        List<TaskCreator> Tasks);
}
