namespace Application.API.DTO.Autors
{
    public record class AuthorsResponse(
        Guid Id,
        string? Name,
        string? Description,
        int CountCourses
        );
}
