using Application.Domain.Models.RootCodeProblem;
using Application.Infrastructure.DataBase;
using Application.Infrastructure.Entities.EntityExecutorCode;
using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;


namespace Application.Infrastructure.Repositories.ExecutorCode
{
    public class CodeProblemRep : ICodeProblemRep
    {
        private readonly ExecutorCodeDbContext _context;


        public CodeProblemRep(ExecutorCodeDbContext context)
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
            var CodeProblementity = new CodeProblemEntity (title,description,difficulty );
            Console.WriteLine(CodeProblementity.Id);
            _context.CodeProblemEntity.Add(CodeProblementity);
            await _context.SaveChangesAsync();
            return CodeProblementity.Id;
        }


        //TestCase
        public async Task AddTestCase(Guid id, string input, string output)
        {
            var testCase = new TestCasesEntity(id, input, output);
            Console.WriteLine(testCase.Id);
            _context.TestCasesEntity.Add(testCase);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TestCase>> GetAllTestCase(Guid id)
        {
            var testCases = await _context.TestCasesEntity
                .AsNoTracking()
                .Where(x => x.CodeProblemEntityId == id)
                .ToListAsync();
            return   testCases.Select(x => new TestCase(x.Id,x.Input,x.ExpectedOutput)).ToList();
        }




        public async Task<List<CodeProblem>> GetAll()
        {
            var CodeProblementity = await _context.CodeProblemEntity
                .AsNoTracking()
                .ToListAsync();
            return CodeProblementity.Select(x => CodeProblem.Create(x.Id,x.Title, x.Description, x.Difficulty).Value).ToList();
        }



        public async Task<bool> Delete(Guid id)
        {
            var entity = await _context.CodeProblemEntity
                .FirstOrDefaultAsync(x => x.Id == id);


            if (entity == null) return false;
            _context.CodeProblemEntity.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
