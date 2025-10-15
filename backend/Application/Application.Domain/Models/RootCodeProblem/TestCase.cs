using CSharpFunctionalExtensions;

namespace Application.Domain.Models.RootCodeProblem
{
    public class TestCase
    {
        public Guid CodeProblemId { get; }

        public CodeProblem CodeProblem { get; }
        public string Input { get; } //ввод
        public string ExpectedOutput { get; } //ожидаемый вывод
        public bool IsHidden { get; } //есть ли мэтч ввода с выводом

        private TestCase(Guid id, string input, string expectedOutput, bool isHidden)
        {
            Input = input;
            ExpectedOutput = expectedOutput;
            IsHidden = isHidden;
        }

        public static Result<TestCase> Create(string input, string expectedOutput, bool isHidden)
        {
            //Добавить валидацию входных данных

            var TestCase_item = new TestCase(Guid.NewGuid(), input, expectedOutput, isHidden);

            return Result.Success(TestCase_item);
        }
    }
}
