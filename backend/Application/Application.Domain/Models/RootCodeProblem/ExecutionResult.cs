using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Domain.Models
{
    public class ExecutionResult
    {
        public bool Success { get; }
        public string Output { get; } = string.Empty;
        public string Error { get; } = string.Empty;
        public long ExecutionTime { get; }
        public bool Passed { get; }
    }
}
