using System.Diagnostics;
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

        public async Task<List<ExecutionResult>> Execute(Guid id, string pythonCode)
        {
            Console.WriteLine($"Starting execution for problem {id}");

            CodeProblem problem = await _codeProblemRep.GetById(id);
            List<TestCase> testCases = problem._testCases;

            Console.WriteLine($"Found {testCases.Count} test cases");

            var testResults = new List<ExecutionResult>();

            foreach (var testCase in testCases)
            {
                Console.WriteLine($"Processing test case: Input='{testCase.Input}', Expected='{testCase.ExpectedOutput}'");

                try
                {
                    var process = new Process();
                    process.StartInfo = new ProcessStartInfo
                    {
                        FileName = "python",
                        Arguments = $"-c \"{pythonCode.Replace("\"", "\\\"")}\"",
                        UseShellExecute = false,
                        RedirectStandardInput = true,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    };

                    Console.WriteLine("Starting Python process...");
                    process.Start();

                    // Записываем входные данные
                    await process.StandardInput.WriteLineAsync(testCase.Input);
                    process.StandardInput.Close();

                    // Читаем результат
                    string output = await process.StandardOutput.ReadToEndAsync();
                    string error = await process.StandardError.ReadToEndAsync();

                    await process.WaitForExitAsync();

                    Console.WriteLine($"Process finished. ExitCode: {process.ExitCode}");
                    Console.WriteLine($"Output: '{output}'");
                    Console.WriteLine($"Error: '{error}'");

                    var executionResult = ExecutionResult.Create(
                        problem,
                        process.ExitCode == 0 && string.IsNullOrEmpty(error) && output.Trim() == testCase.ExpectedOutput,
                        output.Trim(),
                        error.Trim(),
                        0 // временно 0
                    ).Value;

                    testResults.Add(executionResult);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Exception: {ex}");
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
    }
}