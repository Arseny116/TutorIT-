namespace Application.API.DTO.Theories
{
    public record class TheoriesRequest(
        string Name,
        string Article,
        IFormFile? TitleImage
        );
}
