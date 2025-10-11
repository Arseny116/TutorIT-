
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Domain.Models.RootCodeProblem
{
    public class CodeSubmission
    {
        public Guid ProblemId { get; }

        public string Language { get; } = string.Empty;


        public string SourceCode { get; } = string.Empty;

        public DateTime SubmittedAt { get; }

        private CodeSubmission() { }
    }
}