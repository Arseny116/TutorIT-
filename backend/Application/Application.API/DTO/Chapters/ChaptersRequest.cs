namespace Application.API.DTO.Chapters
{
    public record class ChaptersRequest(
        string Name,
        string Description,
        int NumberTheoryBloks,
        int NumberTasks);
}
