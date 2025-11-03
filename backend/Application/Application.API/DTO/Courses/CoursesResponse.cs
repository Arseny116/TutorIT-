using Application.Domain.Models;

namespace Application.API.DTO.Courses
{
    public record class CoursesResponse(
        Guid Id,
        string? Title,
        string? Description,
        int Chapters,
        double? Evaluation,
        List<string> Reviews,
        int Subscribe,
        List<Chapter> NumberChapters);
}
