namespace Application.API.DTO.Courses
{
    public record class CoursesRequest(
        List<string> PL,
        string Title,
        string Description,
        int Chapters,
        int Complexity,
        IFormFile? TitleImage
        );
}
