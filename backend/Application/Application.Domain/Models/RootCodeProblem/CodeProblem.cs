using CSharpFunctionalExtensions;

namespace Application.Domain.Models.RootCodeProblem
{
    //Попробывать когда нить через агрегат сделать
    public class CodeProblem
    {
        public int Id { get; }
        public string Title { get; }
        public string Description { get; }
        public string Difficulty { get; }


        private readonly List<TestCase> _testCases = new();

        private readonly List<CodeTemplate> _templates = new();

        private CodeProblem(Guid id, string title, string description, string difficulty)
        {
            Title = title;
            Description = description;
            Difficulty = difficulty;
        }



        public static Result<CodeProblem> Create(Guid id, string title, string description, string difficulty)
        {

            //Добавить валидацию входных данных


            var CodeProblem_item = new CodeProblem
            (
                Guid.NewGuid(),
                title.Trim(),
                description?.Trim() ?? string.Empty,
                difficulty

            );
            return Result.Success(CodeProblem_item);
        }
    }
}
