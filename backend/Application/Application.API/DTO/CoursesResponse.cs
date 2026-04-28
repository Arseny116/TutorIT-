using Application.Domain.Models;

namespace Application.API.DTO.Courses
{
    public record class CoursesResponse(
        Guid Id,
        List<string> PL,
        string? Title,
        string? Description,
        int Chapters,
        int Complexity,
        string? TitleImage,
        double? Evaluation,
        List<string> Reviews,
        int Subscribe,
        List<Chapter> NumberChapters
    );
}
