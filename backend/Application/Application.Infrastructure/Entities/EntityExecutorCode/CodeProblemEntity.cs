namespace Application.Infrastructure.Entities.EntityExecutorCode
{

    //Done
    public class CodeProblemEntity
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;


        public List<TestCasesEntity> TestCases = new List<TestCasesEntity>();

        public List<CodeTemplateEntity>  Templates = new List<CodeTemplateEntity>();
    }
}
