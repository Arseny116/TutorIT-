using Application.Infrastructure.DataBase;
using Application.Infrastructure.Entities.EntityExecutorCode;

namespace Application.Infrastructure.Repositories.ExecutorCode
{
    public class ExecutionResultRep
    {
        private readonly ExecutorCodeDbContext _context;

        public ExecutionResultRep(ExecutorCodeDbContext context)
        {
            _context = context;
        }


        public async Task Create(string title, string description, string difficulty)
        {
            _context.ExecutionResults.Add(new ExecutionResultEntity { });
            await _context.SaveChangesAsync();
        }

    }
}
