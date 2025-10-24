using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Domain.Models.RootCodeProblem;
using CSharpFunctionalExtensions;

namespace Application.Domain.Models
{
    public class ExecutionResult
    {
        public Guid Id { get; }
        public Guid CodeProblem_Id { get; private set; }

        public CodeProblem CodeProblem { get; private set; }

        public bool Success { get; }
        public string Output { get; } = string.Empty;
        public string Error { get; } = string.Empty;
        public int ExecutionTime { get; }

        private ExecutionResult(Guid id, CodeProblem codeProblem, bool success, string output, string error, int executionTime)
        {
            Id = id;
            CodeProblem_Id = codeProblem.Id;
            CodeProblem = codeProblem;
            Success = success;
            Output = output;
            Error = error;
            ExecutionTime = executionTime;
        }

        public static Result<ExecutionResult> Create(CodeProblem codeProblem, bool success, string output, string error, int executionTime)
        {

            //Добавить валидацию входных данных


            var CodeProblem_item = new ExecutionResult
            (
                Guid.NewGuid(),
                codeProblem,
                success,
                output,
                error ?? string.Empty,
                executionTime
            );
            return Result.Success(CodeProblem_item);
        }
    }
}
