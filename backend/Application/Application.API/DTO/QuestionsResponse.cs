namespace Application.API.DTO.Questions
{
    public record class QuestionsResponse(
        Guid Id,
        string? Name,
        bool Answer);
}
