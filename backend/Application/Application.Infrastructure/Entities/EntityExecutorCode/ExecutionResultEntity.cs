using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Infrastructure.Entities.EntityExecutorCode
{
    public class ExecutionResultEntity
    {
        public Guid ID { get; set; }
        public Guid CodeProblem_Id { get; }
        public bool Success { get; set; }
        public string Output { get; set; }
        public string Error { get; set; }
        public int ExecutionTime { get; set; }
    }
}
