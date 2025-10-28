using Application.Infrastructure.Entities.EntityExecutorCode;

namespace Application.Infrastructure.Repositories.RepositoriesExecutorCode
{
    public class ExecutionResultRep
    {
        private readonly TutorITDbContext _context;

        public ExecutionResultRep(TutorITDbContext context)
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
