namespace Application.Infrastructure.Entities.EntityExecutorCode
{
    public class SubmissionEntity
    {
        public Guid ProblemId { get; set; }

        public string Language { get; set; } = string.Empty;


        public string SourceCode { get; set; } = string.Empty;

        public DateTime SubmittedAt { get; set; }
    }
}
