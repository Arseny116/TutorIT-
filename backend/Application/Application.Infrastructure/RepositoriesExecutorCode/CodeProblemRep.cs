using Application.Domain.Models.RootCodeProblem;
using Application.Infrastructure.Entities.EntityExecutorCode;
using AutoMapper;
using Microsoft.EntityFrameworkCore;


namespace Application.Infrastructure.Repositories
{
    public class CodeProblemRep : ICodeProblemRep
    {
        private readonly TutorITDbContext _context;


        public CodeProblemRep(TutorITDbContext context)
        {
            _context = context;
        }


        public async Task<CodeProblem> GetById(Guid Id)
        {
            var CodeProblementity = await _context.CodeProblemEntity
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == Id);
            return CodeProblem.Create(CodeProblementity.Id, CodeProblementity.Title, CodeProblementity.Description, CodeProblementity.Difficulty).Value;
        }

        public async Task<Guid> Create(string title, string description, string difficulty)
        {
            var CodeProblementity = new CodeProblemEntity { Id = Guid.NewGuid(), Title = title, Description = description, Difficulty = difficulty };
            _context.CodeProblemEntity.Add(CodeProblementity);
            await _context.SaveChangesAsync();
            return CodeProblementity.Id;
        }


        public async Task AddTestCase(Guid id,string str)
        {
            var CodeProblementity = await GetById(id);

            CodeProblementity._testCases.Add(new TestCasesEntity());
        }



        public async Task<List<CodeProblem>> GetAll()
        {
            var CodeProblementity = await _context.CodeProblemEntity
                .AsNoTracking()
                .ToListAsync();
            return CodeProblementity.Select(x => CodeProblem.Create(x.Id, x.Title, x.Description, x.Difficulty).Value).ToList();
        }



        public async Task<bool> Delete(Guid id)
        {
            var entity = await _context.CodeProblemEntity.FindAsync(id);
            if (entity == null) return false;
            _context.CodeProblemEntity.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }



    }
}
