namespace Application.API.DTO.Courses
{
    public record class CoursesRequest(
        string Title,
        string Description,
        int Chapters
        );
}
