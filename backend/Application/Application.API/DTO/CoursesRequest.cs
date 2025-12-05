namespace Application.API.DTO.Courses
{
    public record class CoursesRequest(
        string PL,
        string Title,
        string Description,
        int Chapters,
        int Complexity
        );
}
