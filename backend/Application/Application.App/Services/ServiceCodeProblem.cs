using System.Diagnostics;
using System.Text;
using Application.Domain.Models;
using Application.Domain.Models.RootCodeProblem;
using Application.Infrastructure.Repositories;

namespace Application.App.Services
{
    public class ServiceCodeProblem : IServiceCodeProblem
    {
        private readonly ICodeProblemRep _codeProblemRep;

        public ServiceCodeProblem(ICodeProblemRep codeProblemRep)
        {
            _codeProblemRep = codeProblemRep;
        }
        public async Task<Guid> CreateCodeProblem(string title, string description, string difficulty)
        {
            var x = await _codeProblemRep.Create(title, description, difficulty);
            return x;
        }

        public async Task<CodeProblem> GetById(Guid Id)
        {
            return await _codeProblemRep.GetById(Id);
        }

        public async Task AddTestCase(Guid id, string input, string output)
        {
            await _codeProblemRep.AddTestCase(id, input, output);
        }

        public async Task<List<CodeProblem>> GetAll()
        {
            return await _codeProblemRep.GetAll();
        }

        public async Task<bool> Delete(Guid id)
        {
            return await _codeProblemRep.Delete(id);
        }

        public async Task<List<ExecutionResult>> Execute(Guid id, string pythonCode)
        {
        

            CodeProblem problem = await _codeProblemRep.GetById(id);

            List<TestCase> testCases = await GetAllTestCase(problem.Id);

            string tempPath = Path.GetTempPath();
            string pyfile = Path.Combine(tempPath, Guid.NewGuid().ToString() + ".py");

         

            await File.WriteAllTextAsync(pyfile,pythonCode, Encoding.UTF8);

           

            var testResults = new List<ExecutionResult>();

            foreach (var testCase in testCases)
            {
                

                try
                {
                    var process = new Process();
                    process.StartInfo = new ProcessStartInfo
                    {
                        FileName = "python",
                        Arguments = $"\"{pyfile}\"",
                        UseShellExecute = false,
                        RedirectStandardInput = true,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    };

                  
                    process.Start();

                    
                    await process.StandardInput.WriteLineAsync(testCase.Input);
                    process.StandardInput.Close();

                   
                    string output = await process.StandardOutput.ReadToEndAsync();
                    string error = await process.StandardError.ReadToEndAsync();

                   
                    

                    await process.WaitForExitAsync();

                  

                    var executionResult = ExecutionResult.Create(
                        problem,
                        output == testCase.ExpectedOutput,
                        output,
                        error,
                        0 
                    ).Value;

                    testResults.Add(executionResult);
                }
                catch (Exception ex)
                {
                    var errorResult = ExecutionResult.Create(
                        problem,
                        false,
                        "",
                        $"Execution failed: {ex.Message}",
                        0
                    ).Value;
                    testResults.Add(errorResult);
                }
            }

            return testResults;
        }

        public Task<List<TestCase>> GetAllTestCase(Guid id)
        {
            return _codeProblemRep.GetAllTestCase(id);
        }
    }
}