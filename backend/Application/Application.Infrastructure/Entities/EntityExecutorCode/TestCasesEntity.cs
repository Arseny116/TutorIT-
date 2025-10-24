using Application.Infrastructure.Entities.EntityExecutorCode;

public class TestCasesEntity
{
    public Guid Id { get; set; }
    public Guid CodeProblemEntityId { get; set; }
    public string Input { get; set; }
    public string ExpectedOutput { get; set; }


    public CodeProblemEntity CodeProblemEntity { get; set; }

 
    public TestCasesEntity(Guid codeProblemEntityId, string input, string expectedOutput)
    {
        Id = Guid.NewGuid();
        CodeProblemEntityId = codeProblemEntityId;
        Input = input;
        ExpectedOutput = expectedOutput;
    }

    
    public TestCasesEntity() { }
}
