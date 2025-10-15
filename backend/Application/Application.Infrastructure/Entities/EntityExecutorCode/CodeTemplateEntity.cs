    namespace Application.Infrastructure.Entities.EntityExecutorCode
{
    public class CodeTemplateEntity
    {
        public Guid ID_Problem { get; set; }
        public CodeProblemEntity CodeProblemEntity { get; set; }
        public string Language { get; set; } = string.Empty;
        public string TemplateCode { get; set; } = string.Empty;
    }
}
