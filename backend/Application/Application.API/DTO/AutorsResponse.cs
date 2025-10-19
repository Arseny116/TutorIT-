namespace Application.API.DTO
{
    public record class AutorsResponse(
        Guid Id,
        string? Name,
        string? Description,
        int CountCourses
        );
}
