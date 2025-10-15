using Application.Infrastructure.Entities.EntityExecutorCode;
using AutoMapper;

namespace Application.Infrastructure.RepositoriesExecutorCode
{
    public class ExecutionResultRep
    {
        private readonly TutorITDbContext _context;
        private readonly IMapper _mapper;

        public ExecutionResultRep(TutorITDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }


        public async Task Create(string title, string description, string difficulty)
        {
            _context.ExecutionResults.Add(new ExecutionResultEntity { });
            await _context.SaveChangesAsync();
        }

    }
}
