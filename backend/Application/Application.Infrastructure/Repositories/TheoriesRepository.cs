using Application.Domain.Interface.ITheory;
using Application.Domain.Models;
using Application.Infrastructure.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Infrastructure.Repositories
{
    public class TheoriesRepository : ITheoriesRepository
    {
        private readonly TutorITDbContext _context;

        public TheoriesRepository(TutorITDbContext context)
        {
            _context = context;
        }

        public async Task<List<Theory>> Get(Guid ChapterId)
        {
            var theoryEntity = await _context.Theories.Where(te => te.ChapterID==ChapterId) .AsNoTracking().ToListAsync();

            var theories = new List<Theory>();
            foreach (var entity in theoryEntity)
            {
                var result = Theory.Create(entity.Id, entity.Name, entity.Article);

                if (result.IsSuccess)
                {
                    theories.Add(result.Value);
                }
            }

            return theories;
        }

        public async Task<Guid> Create(Guid chapterId, Theory theory)
        {
            var theoryEntity = new TheoryEntity
            {
                Id = theory.Id,
                Name = theory.Name,
                Article = theory.Article,
                ChapterID = chapterId
            };
       
            
            await _context.Theories.AddAsync(theoryEntity);
            await _context.SaveChangesAsync();

            return theoryEntity.Id;
        }

        public async Task<Guid> Update(Guid id, string name, string article)
        {
            await _context.Theories.Where(x => x.Id == id)
                .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.Name, name)
                .SetProperty(a => a.Article, article));

            return id;
        }

        public async Task<Guid> Delete(Guid id)
        {
            await _context.Theories.Where(x => x.Id == id).ExecuteDeleteAsync();

            return id;
        }
    }
}
