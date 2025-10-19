namespace Application.API.DTO.Courses
{
    public record class CoursesResponse(
        Guid Id,
        string? Title,
        string? Description,
        int Tasks,
        double? Evaluation,
        string? Reviews,
        int Subscribe
        );
}
