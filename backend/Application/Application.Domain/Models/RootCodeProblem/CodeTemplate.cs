using CSharpFunctionalExtensions;

namespace Application.Domain.Models.RootCodeProblem
{
    public class CodeTemplate
    {
        public Guid Id { get; }
        public string Language { get; }
        public string TemplateCode { get; }

        private CodeTemplate(Guid id, string language, string templateCode)
        {
            Id = id;
            Language = language;
            TemplateCode = templateCode;
        }

        public static Result<CodeTemplate> Create(string language, string templateCode)
        {
            //Добавить валидацию входных данных

            var CodeTemplate = new CodeTemplate(Guid.NewGuid(), language, templateCode);


            return Result.Success(CodeTemplate);
        }
    }
}
