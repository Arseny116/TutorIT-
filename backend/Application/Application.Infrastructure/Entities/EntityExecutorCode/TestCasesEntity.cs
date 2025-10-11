using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Infrastructure.Entities.EntityExecutorCode
{
    public class TestCasesEntity
    {
        public Guid ID_Problem { get; set; }
        public CodeProblemEntity CodeProblemEntity { get; set; }
        public string Input { get; set; }
        public string ExpectedOutput { get; set; }
        public bool IsHidden { get; set; }

    }
}
