namespace Application.API.DTO.Courses
{
    public record class TasksCreatorRequest(
        string Title,
        string Description,
        int Chapters,
        int Complexity
        );
}
