using Application.Domain.Models;
using Application.Domain.Models.TaskQuestion;

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
