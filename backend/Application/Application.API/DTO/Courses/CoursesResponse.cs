namespace Application.API.DTO.Courses
{
    public record class CoursesResponse(
        Guid Id,
        string? Title,
        string? Description,
        int Tasks,
        double? Evaluation,
        List<string> Reviews,
        int Subscribe
        );
}
