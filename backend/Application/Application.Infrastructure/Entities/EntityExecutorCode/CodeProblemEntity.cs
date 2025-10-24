
namespace Application.Infrastructure.Entities.EntityExecutorCode
{
    public class CodeProblemEntity
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;

        public List<TestCasesEntity> TestCases { get; set; } = new List<TestCasesEntity>();

        public List<CodeTemplateEntity> Templates { get; set; } = new List<CodeTemplateEntity>();

        public CodeProblemEntity(string title, string description, string difficulty)
        {
            Id = Guid.NewGuid();
            Title = title;
            Description = description;
            Difficulty = difficulty;
        }
    }
}
