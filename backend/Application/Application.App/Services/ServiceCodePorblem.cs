
using System.Diagnostics;
using Application.Domain.Models;
using Application.Domain.Models.RootCodeProblem;
using Application.Infrastructure;
using Application.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace Application.App.Services
{
    public class ExecutePythonAsync
    {
        private readonly ICodeProblemRep _codeProblemRep;

        public ExecutePythonAsync(ICodeProblemRep codeProblemRep)
        {
            _codeProblemRep = codeProblemRep;
        }


        public async Task<ExecutionResult> Execute(Guid id, string pythontext)
        {

            CodeProblem problem = _codeProblemRep.GetById(id).Result;
            List<TestCase> testCase = problem._testCases;


            var tempFile = Path.GetTempFileName() + ".py";

            var text = new List<string>();

            text.Add(pythontext);

            await File.WriteAllLinesAsync(tempFile, text);




            var process = new Process();
            ;
            process.StartInfo = new ProcessStartInfo
            {
                FileName = tempFile,
                Arguments = $"{tempFile}",
            };


            process.Start();


            List<ExecutionResult> test_result = new List<ExecutionResult>();
            foreach (var item in testCase)
            {
                await process.StandardInput.WriteLineAsync(item.Input);
                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();

                var res_test = ExecutionResult.Create(process.ExitCode == 0, output, error, Math.Abs(process.StartTime.Millisecond - DateTime.Now.Millisecond)).Value;

                test_result.Add(res_test);
            }



            await process.WaitForExitAsync();

            File.Delete(tempFile);
        }

    }
}
