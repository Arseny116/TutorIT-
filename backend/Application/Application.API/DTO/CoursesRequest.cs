namespace Application.API.DTO
{
    public record class CoursesRequest(
        string Title,
        string Description,
        int Tasks
        );
}
