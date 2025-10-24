using CSharpFunctionalExtensions;

namespace Application.Domain.Models.RootCodeProblem
{
    public class TestCase
    {
        public Guid Id { get; set; }
        public Guid CodeProblemId { get; }

        public CodeProblem CodeProblem { get; }
        public string Input { get; } //ввод
        public string ExpectedOutput { get; } //ожидаемый вывод
 

     
        //Переделать
        public TestCase(Guid id, string input, string expectedOutput)
        {
            Id = Guid.NewGuid();
            CodeProblemId = id;
            Input = input;
            ExpectedOutput = expectedOutput;
        }

       /* public static Result<TestCase> Create(string input, string expectedOutput, bool isHidden)
        {
            //Добавить валидацию входных данных

            var TestCase_item = new TestCase(Guid.NewGuid(), input, expectedOutput, isHidden);

            return Result.Success(TestCase_item);
        }*/
    }
}
