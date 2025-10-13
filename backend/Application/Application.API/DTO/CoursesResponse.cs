namespace Application.API.DTO
{
    public record class CoursesResponse(
        Guid Id,
        string Title,
        string Description,
        int Tasks,
        double Evaluation,
        string Reviews,
        int Subscribe
        );
}
