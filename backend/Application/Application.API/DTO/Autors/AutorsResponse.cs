namespace Application.API.DTO.Autors
{
    public record class AutorsResponse(
        Guid Id,
        string? Name,
        string? Description,
        int CountCourses
        );
}
